import { VideoFrameDecoder } from "./VideoFrameDecoder";
import { VideoRenderer } from "./VideoRenderer";
import { VideoTrackBuffer } from "./VideoTrackBuffer";
import { VideoHelpers } from "./VideoHelpers";
import { videoPlayerBus } from "./VideoPlayerBus";
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
  private currentTime = 0;
  private lastAdvanceTime = 0;
  private totalDuration = 0;

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
      this.seek(this.currentTime);
    }

    const totalDuration = this.videoTrackBuffers.reduce(
      (cur, trackBuffer) => cur + trackBuffer.getDuration(),
      0,
    );
    this.totalDuration = totalDuration;
    videoPlayerBus.dispatch("totalDuration", totalDuration);
  };

  setCanvasBox = (canvasBox: HTMLDivElement) => {
    this.renderer.setCanvasBox(canvasBox);
  };

  exportVideo = async () => {
    this.exporter.exportVideo(this.videoTrackBuffers);
  };

  changeFrameFilters = () => {
    this.frameChanger.changeFrameFilters();
    this.seek(this.currentTime);
  };

  play = () => {
    this.lastAdvanceTime = performance.now();
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

  seek = (time: number) => {
    if (this.advanceLoopId) {
      cancelAnimationFrame(this.advanceLoopId);
      this.advanceLoopId = null;
    }
    this.resetVideo();
    this.currentTime = VideoHelpers.clampTime(time, this.totalDuration);
    videoPlayerBus.dispatch("currentTime", this.currentTime);
    this.decodeVideoFrames();

    if (this.playing) {
      this.play();
    }
  };

  playForward = () => {
    this.seek(this.currentTime + 5);
  };

  playBackward = () => {
    this.seek(this.currentTime - 5);
  };

  private advanceCurrentTime(now: number) {
    this.currentTime = this.getCurrentVideoTime(now);
    this.lastAdvanceTime = now;
    let reachedEnd = false;

    if (this.currentTime >= this.totalDuration) {
      reachedEnd = true;
      this.currentTime = this.totalDuration;
    }

    videoPlayerBus.dispatch("currentTime", this.currentTime);
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
      const dependenciesAtTs = Math.max(this.currentTime - prefixTimestamp, 0);
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
    const currentTimeInMicros = Math.floor(1e6 * this.currentTime);

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

    const newFrame = this.frameChanger.processFrame(videoFrame);
    this.frameQueue.push(newFrame);

    if (
      this.lastRenderedVideoFrameTs === null &&
      this.scheduleRenderId === null
    ) {
      this.scheduleRenderId = requestAnimationFrame(() =>
        this.renderVideoFrame(),
      );
    }
  };

  private getActiveVideoTrack() {
    let trackBuffer: VideoTrackBuffer | null = null;
    let prefixTimestamp = 0;

    for (let i = 0; i < this.videoTrackBuffers.length; i++) {
      if (
        prefixTimestamp <= this.currentTime &&
        this.currentTime <=
          this.videoTrackBuffers[i].getDuration() + prefixTimestamp
      ) {
        trackBuffer = this.videoTrackBuffers[i];
        break;
      }
      prefixTimestamp += this.videoTrackBuffers[i].getDuration();
    }

    if (!trackBuffer) return null;
    return { prefixTs: prefixTimestamp, buffer: trackBuffer };
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

    const currentTimeInMicros = Math.floor(1e6 * this.currentTime);
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
        this.renderer.draw(currentFrame);
        this.lastRenderedVideoFrameTs = currentFrame.timestamp;
      }
      frameIndexesToRemove.add(currentFrameIndex);
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
    this.resetScheduleRenderId();
    this.furthestDecodingVideoChunk = null;
    this.lastRenderedVideoFrameTs = null;
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

  private getCurrentVideoTime(now: number) {
    const elapsedTime = (now - this.lastAdvanceTime) / 1000;
    return this.currentTime + elapsedTime;
  }
}
