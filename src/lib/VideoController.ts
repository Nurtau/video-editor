import { type MP4ArrayBuffer } from "mp4box";

import { VideoDemuxer } from "./VideoDemuxer";
import { VideoFrameDecoder } from "./VideoDecoder";
import { VideoRenderer } from "./VideoRenderer";
import { VideoTrackBuffer } from "./VideoTrackBuffer";

export class VideoController {
  private frameDecoder: VideoFrameDecoder;
  private renderer: VideoRenderer;
  private frameQueue: VideoFrame[] = [];
  private videoTrackBuffers: VideoTrackBuffer[] = [];

  private currentTime = 0;
  private lastAdvanceTime = 0;

  private decodingFrameGroups = new Set<EncodedVideoChunk[]>();

  constructor() {
    this.frameDecoder = new VideoFrameDecoder({
      onDecode: this.onDecodedVideoFrame,
    });
    this.renderer = new VideoRenderer();
  }

  setCanvas = (canvas: HTMLCanvasElement) => {
    this.renderer.setCanvas(canvas);
  };

  async setVideoArrayBuffer(arrayBuffer: ArrayBuffer | string) {
    const demuxer = new VideoDemuxer(arrayBuffer as MP4ArrayBuffer);
    const info = await demuxer.getInfo();
    const samples = await demuxer.getSamples();
    const file = demuxer.getFile();

    const track = info.videoTracks[0];
    const trak = file.getTrackById(track.id);
    const codecConfig = VideoFrameDecoder.buildConfig(track, trak);
    const videoTrackBuffer = new VideoTrackBuffer(samples, codecConfig);
    this.videoTrackBuffers.push(videoTrackBuffer);

    this.play();
  }

  private play() {
    this.lastAdvanceTime = performance.now();
    requestAnimationFrame((now) => this.advanceCurrentTime(now));
  }

  private advanceCurrentTime(now: number) {
    this.currentTime = this.getCurrentVideoTime(now);
    this.lastAdvanceTime = now;

    this.decodeVideoFrames();
    this.renderVideoFrame();

    requestAnimationFrame((now) => this.advanceCurrentTime(now));
  }

  private decodeVideoFrames() {
    // @TODO: handle multiple track buffer on multiple videos
    const trackBuffer = this.videoTrackBuffers[0];

    const videoChunks = trackBuffer.getVideoChunksAtTime(this.currentTime);
    if (!videoChunks) return;

    const codecConfig = trackBuffer.getCodecConfig();

    if (!this.decodingFrameGroups.has(videoChunks)) {
      this.decodingFrameGroups.add(videoChunks);
      videoChunks.forEach((chunk) =>
        this.frameDecoder.decode(chunk, codecConfig),
      );
    }

    // @TODO: decode next videoframes if they are not decoding
  }

  private onDecodedVideoFrame = (videoFrame: VideoFrame) => {
    const currentTimeInMicros = Math.floor(1e6 * this.currentTime);

    if (videoFrame.timestamp + videoFrame.duration! < currentTimeInMicros) {
      videoFrame.close();
      return;
    }

    this.frameQueue.push(videoFrame);
  };

  private renderVideoFrame() {
    const currentTimeInMicros = Math.floor(1e6 * this.currentTime);

    const frameIndexesToRemove = new Set<number>();

    this.frameQueue.forEach((frame, index) => {
      if (frame.timestamp + frame.duration! < currentTimeInMicros) {
        frameIndexesToRemove.add(index);
      }
    });

    const currentFrameIndex = this.frameQueue.findIndex((frame) => {
      return (
        frame.timestamp <= currentTimeInMicros &&
        currentTimeInMicros < frame.timestamp + frame.duration!
      );
    });

    if (currentFrameIndex !== -1) {
      const currentFrame = this.frameQueue[currentFrameIndex];
      this.renderer.draw(currentFrame);
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

  private getCurrentVideoTime(now: number) {
    const elapsedTime = (now - this.lastAdvanceTime) / 1000;
    return this.currentTime + elapsedTime;
  }
}
