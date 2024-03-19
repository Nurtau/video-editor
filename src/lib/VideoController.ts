import { VideoFrameDecoder } from "./VideoFrameDecoder";
import { VideoRenderer } from "./VideoRenderer";
import { VideoTrackBuffer } from "./VideoTrackBuffer";
import { VideoHelpers } from "./VideoHelpers";
import { eventsBus } from "./EventsBus";
import { VideoExporter } from "./VideoExporter";
import { VideoFrameChanger } from "./VideoFrameChanger";

const MAX_CAPACITY = 25;

interface VideoControllerState {
  playing: boolean;
}

interface VideoControllerProps {
  onEmit(state: Partial<VideoControllerState>): void;
}

export class VideoController {
  private onEmit: VideoControllerProps["onEmit"];
  private frameDecoder: VideoFrameDecoder;
  private renderer: VideoRenderer;

  private frameQueue: VideoFrame[] = [];
  private decodingChunks: EncodedVideoChunk[] = [];
  private videoTrackBuffers: VideoTrackBuffer[] = [];

  private playing = false;
  private currentTimeInS = 0;
  private lastAdvanceTimeInMs = 0;
  private totalDurationInS = 0;

  private advanceLoopId: number | null = null;
  private scheduleRenderId: number | null = null;

  private furthestDecodingVideoChunk: EncodedVideoChunk | null = null;
  private lastRenderedVideoFrameTs: number | null = null;

  private activeVideoTrack: {
    prefixTs: number;
    buffer: VideoTrackBuffer;
  } | null = null;

  private exporter: VideoExporter;
  private frameChanger: VideoFrameChanger;

  static buildDefaultState(): VideoControllerState {
    return {
      playing: false,
    };
  }

  constructor({ onEmit }: VideoControllerProps) {
    this.onEmit = onEmit;
    this.frameDecoder = new VideoFrameDecoder({
      onDecode: this.onDecodedVideoFrame,
    });
    this.renderer = new VideoRenderer();
    this.frameChanger = new VideoFrameChanger();
    this.exporter = new VideoExporter({
      processFrame: this.frameChanger.processFrame,
    });
  }

  setVideoTrackBuffers = (videoTrackBuffers: VideoTrackBuffer[]) => {
    this.videoTrackBuffers = videoTrackBuffers;

    if (this.videoTrackBuffers.length > 0) {
      this.seek(this.currentTimeInS);
    }

    const totalDuration = this.videoTrackBuffers.reduce(
      (cur, trackBuffer) => cur + trackBuffer.getDuration(),
      0,
    );
    this.totalDurationInS = totalDuration;
    eventsBus.dispatch("totalDuration", totalDuration);
  };

  setCanvasBox = (canvasBox: HTMLDivElement) => {
    this.renderer.setCanvasBox(canvasBox);
  };

  exportVideo = async () => {
    this.exporter.exportVideo(this.videoTrackBuffers);
  };

  play = () => {
    this.lastAdvanceTimeInMs = performance.now();
    this.advanceLoopId = requestAnimationFrame((now) =>
      this.advanceCurrentTime(now),
    );
    this.playing = true;
    this.onEmit({ playing: true });
  };

  pause = () => {
    if (this.advanceLoopId) {
      cancelAnimationFrame(this.advanceLoopId);
      this.advanceLoopId = null;
    }

    this.playing = false;
    this.onEmit({ playing: false });
  };

  seek = (timeInSeconds: number) => {
    if (this.advanceLoopId) {
      cancelAnimationFrame(this.advanceLoopId);
      this.advanceLoopId = null;
    }

    const isTimeCloseToCurrent =
      timeInSeconds >= this.currentTimeInS &&
      timeInSeconds - this.currentTimeInS < 0.01;

    if (!isTimeCloseToCurrent) {
      this.resetVideo();
    }

    this.resetScheduleRenderId();
    this.lastRenderedVideoFrameTs = null;

    this.currentTimeInS = VideoHelpers.clampTime(
      timeInSeconds,
      this.totalDurationInS,
    );
    eventsBus.dispatch("currentTime", this.currentTimeInS);
    this.decodeVideoFrames();
    this.scheduleRenderVideoFrameIfPossible();

    if (this.playing) {
      this.play();
    }
  };

  playForward = () => {
    this.seek(this.currentTimeInS + 5);
  };

  playBackward = () => {
    this.seek(this.currentTimeInS - 5);
  };

  private advanceCurrentTime(now: number) {
    this.currentTimeInS = this.getCurrentVideoTime(now);
    this.lastAdvanceTimeInMs = now;
    let reachedEnd = false;

    if (this.currentTimeInS >= this.totalDurationInS) {
      reachedEnd = true;
      this.currentTimeInS = this.totalDurationInS;
    }

    eventsBus.dispatch("currentTime", this.currentTimeInS);
    this.decodeVideoFrames();
    this.renderVideoFrame();

    if (reachedEnd) {
      this.pause();
    } else {
      this.advanceLoopId = requestAnimationFrame((now) =>
        this.advanceCurrentTime(now),
      );
    }
  }

  private decodeVideoFrames() {
    if (!this.activeVideoTrack) {
      const activeVideoTrack = this.getActiveVideoTrack();

      if (!activeVideoTrack) return;
      this.activeVideoTrack = activeVideoTrack;
    }

    const trackBuffer = this.activeVideoTrack.buffer;
    const prefixTimestamp = this.activeVideoTrack.prefixTs;
    const codecConfig = trackBuffer.getCodecConfig();

    if (this.furthestDecodingVideoChunk === null) {
      // it can be negative when we are decoding frames of next track
      const dependenciesAtTs = Math.max(
        this.currentTimeInS - prefixTimestamp,
        0,
      );
      const videoChunksDependencies =
        trackBuffer.getVideoChunksDependencies(dependenciesAtTs);

      if (!videoChunksDependencies) return;
      this.decodeVideoChunks(
        videoChunksDependencies,
        codecConfig,
        prefixTimestamp,
      );

      const nextVideoChunks = trackBuffer.getNextVideoChunks(
        this.furthestDecodingVideoChunk!,
        1,
      );

      if (!nextVideoChunks || nextVideoChunks.length === 0) {
        this.frameDecoder.flush();
      }
    }

    const availableSpace =
      MAX_CAPACITY - (this.frameQueue.length + this.decodingChunks.length);

    if (availableSpace > 0) {
      const nextVideoChunks = trackBuffer.getNextVideoChunks(
        this.furthestDecodingVideoChunk!,
        availableSpace,
      );

      if (!nextVideoChunks || nextVideoChunks.length === 0) {
        this.frameDecoder.flush();
        const nextTrackBuffer = this.getNextActiveVideoTrack(trackBuffer);

        if (nextTrackBuffer) {
          this.activeVideoTrack = nextTrackBuffer;
          this.furthestDecodingVideoChunk = null;
        }

        return;
      }

      this.decodeVideoChunks(nextVideoChunks, codecConfig, prefixTimestamp);
    }
  }

  private decodeVideoChunks(
    videoChunks: EncodedVideoChunk[],
    codecConfig: VideoDecoderConfig,
    prefixTimestamp: number,
  ) {
    videoChunks.forEach((chunk) => {
      const newChunk = VideoHelpers.recreateVideoChunk(chunk, {
        timestamp: chunk.timestamp + prefixTimestamp * 1e6,
      });

      this.frameDecoder.decode(newChunk, codecConfig);
      this.decodingChunks.push(newChunk);
    });
    this.furthestDecodingVideoChunk = videoChunks[videoChunks.length - 1];
  }

  private onDecodedVideoFrame = (videoFrame: VideoFrame) => {
    const currentTimeInMicros = Math.floor(1e6 * this.currentTimeInS);

    const decodingChunkIndex = this.decodingChunks.findIndex((chunk) =>
      VideoHelpers.isFrameTimestampEqual(chunk, videoFrame),
    );

    if (decodingChunkIndex !== -1) {
      this.decodingChunks.splice(decodingChunkIndex, 1);
    }

    if (videoFrame.timestamp + videoFrame.duration! < currentTimeInMicros) {
      videoFrame.close();
      return;
    }

    this.frameQueue.push(videoFrame);
    this.scheduleRenderVideoFrameIfPossible();
  };

  private scheduleRenderVideoFrameIfPossible() {
    if (
      this.lastRenderedVideoFrameTs === null &&
      this.scheduleRenderId === null
    ) {
      this.scheduleRenderId = requestAnimationFrame(() =>
        this.renderVideoFrame(),
      );
    }
  }

  private getActiveVideoTrackAt(timeInS: number) {
    let trackBuffer: VideoTrackBuffer | null = null;
    let prefixTimestamp = 0;

    for (let i = 0; i < this.videoTrackBuffers.length; i++) {
      if (
        prefixTimestamp <= timeInS &&
        timeInS <= this.videoTrackBuffers[i].getDuration() + prefixTimestamp
      ) {
        trackBuffer = this.videoTrackBuffers[i];
        break;
      }
      prefixTimestamp += this.videoTrackBuffers[i].getDuration();
    }

    if (!trackBuffer) return null;
    return { prefixTs: prefixTimestamp, buffer: trackBuffer };
  }

  private getActiveVideoTrack() {
    return this.getActiveVideoTrackAt(this.currentTimeInS);
  }

  private getNextActiveVideoTrack(trackBuffer: VideoTrackBuffer) {
    const trackBufferIndex = this.videoTrackBuffers.findIndex(
      (track) => track.id === trackBuffer.id,
    );

    const nextTrackIndex = trackBufferIndex + 1;
    if (nextTrackIndex >= this.videoTrackBuffers.length) return null;

    const nextTrackBuffer = this.videoTrackBuffers[nextTrackIndex];
    const prefixTs = this.videoTrackBuffers
      .slice(0, nextTrackIndex)
      .reduce((acc, track) => acc + track.getDuration(), 0);

    return { prefixTs, buffer: nextTrackBuffer };
  }

  private renderVideoFrame() {
    this.resetScheduleRenderId();

    const currentTimeInMicros = Math.floor(1e6 * this.currentTimeInS);
    const frameIndexesToRemove = new Set<number>();

    this.frameQueue.forEach((frame, index) => {
      if (frame.timestamp + frame.duration! < currentTimeInMicros) {
        frameIndexesToRemove.add(index);
      }
    });

    const currentFrameIndex = this.frameQueue.findIndex((frame) => {
      return VideoHelpers.isChunkInTime(frame, currentTimeInMicros);
    });

    if (currentFrameIndex !== -1) {
      const currentFrame = this.frameQueue[currentFrameIndex];

      if (this.lastRenderedVideoFrameTs !== currentFrame.timestamp) {
        const timestampInS = currentFrame.timestamp / 1e6;
        const videoTrack = this.getActiveVideoTrackAt(timestampInS);

        if (!videoTrack) return;

        const processedFrame = this.frameChanger.processFrame(
          currentFrame,
          videoTrack.buffer.getEffects(),
        );
        this.renderer.draw(processedFrame);
        processedFrame.close();
        this.lastRenderedVideoFrameTs = currentFrame.timestamp;
      }
    }

    this.frameQueue = this.frameQueue.filter((frame, index) => {
      if (frameIndexesToRemove.has(index)) {
        frame.close();
        return false;
      }
      return true;
    });
  }

  private resetVideo() {
    this.furthestDecodingVideoChunk = null;
    this.frameDecoder.reset();
    this.frameQueue.forEach((frame) => frame.close());
    this.frameQueue = [];
    this.decodingChunks = [];
    this.activeVideoTrack = null;
  }

  private resetScheduleRenderId() {
    if (this.scheduleRenderId !== null) {
      cancelAnimationFrame(this.scheduleRenderId);
      this.scheduleRenderId = null;
    }
  }

  private getCurrentVideoTime(nowInMs: number) {
    const elapsedTime = (nowInMs - this.lastAdvanceTimeInMs) / 1000;
    return this.currentTimeInS + elapsedTime;
  }
}
