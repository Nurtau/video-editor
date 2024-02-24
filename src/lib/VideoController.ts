import { type MP4ArrayBuffer } from "mp4box";

import { VideoDemuxer } from "./VideoDemuxer";
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
  videoTrackBuffers: VideoTrackBuffer[];
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

  private advanceLoopId: number | null = null;
  private scheduleRenderId: number | null = null;

  private furthestDecodingVideoChunk: EncodedVideoChunk | null = null;
  private lastRenderedVideoFrameTs: number | null = null;

  private exporter: VideoExporter;
  private frameChanger: VideoFrameChanger;

  static buildDefaultState(): VideoControllerState {
    return {
      playing: false,
      videoTrackBuffers: [],
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

  setCanvasBox = (canvasBox: HTMLDivElement) => {
    this.renderer.setCanvasBox(canvasBox);
  };

  setVideoArrayBuffer = async (arrayBuffer: ArrayBuffer | string) => {
    const demuxer = new VideoDemuxer(arrayBuffer as MP4ArrayBuffer);
    const info = await demuxer.getInfo();
    const samples = await demuxer.getSamples();
    const file = demuxer.getFile();

    const track = info.videoTracks[0];
    const trak = file.getTrackById(track.id);
    const codecConfig = VideoFrameDecoder.buildConfig(track, trak);
    const videoTrackBuffer = new VideoTrackBuffer(samples, codecConfig);
    this.videoTrackBuffers.push(videoTrackBuffer);

    this.onEmit({ videoTrackBuffers: this.videoTrackBuffers.slice() });
    videoPlayerBus.dispatch("totalDuration", videoTrackBuffer.getDuration());

    this.seek(0);
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
    this.currentTime = time;
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
    this.seek(Math.max(0, this.currentTime - 5));
  };

  private advanceCurrentTime(now: number) {
    this.currentTime = this.getCurrentVideoTime(now);
    this.lastAdvanceTime = now;
    let reachedEnd = false;

    if (this.currentTime >= this.videoTrackBuffers[0].getDuration()) {
      reachedEnd = true;
      this.currentTime = this.videoTrackBuffers[0].getDuration();
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
    // @TODO: handle multiple track buffer on multiple videos
    const trackBuffer = this.videoTrackBuffers[0];
    const codecConfig = trackBuffer.getCodecConfig();

    if (this.furthestDecodingVideoChunk === null) {
      // it means that we need to decode dependencies first
      const videoChunksDependencies = trackBuffer.getVideoChunksDependencies(
        this.currentTime,
      );

      if (!videoChunksDependencies) return;
      this.decodeVideoChunks(videoChunksDependencies, codecConfig);
    }

    const availableSpace =
      MAX_CAPACITY - (this.frameQueue.length + this.decodingChunks.length);

    if (availableSpace > 0) {
      const nextVideoChunks = trackBuffer.getNextVideoChunks(
        this.furthestDecodingVideoChunk!,
        availableSpace,
      );

      if (!nextVideoChunks) return;
      this.decodeVideoChunks(nextVideoChunks, codecConfig);
    }
  }

  private decodeVideoChunks(
    videoChunks: EncodedVideoChunk[],
    codecConfig: VideoDecoderConfig,
  ) {
    videoChunks.forEach((chunk) => {
      this.frameDecoder.decode(chunk, codecConfig);
      this.decodingChunks.push(chunk);
    });
    this.furthestDecodingVideoChunk = videoChunks[videoChunks.length - 1];
  }

  private onDecodedVideoFrame = (videoFrame: VideoFrame) => {
    const currentTimeInMicros = Math.floor(1e6 * this.currentTime);

    const decodingChunkIndex = this.decodingChunks.findIndex(
      (chunk) => chunk.timestamp === videoFrame.timestamp,
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
