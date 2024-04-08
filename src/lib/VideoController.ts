import { VideoFrameDecoder } from "./VideoFrameDecoder";
import { VideoRenderer, type VideoRendererRawSize } from "./VideoRenderer";
import { VideoBox } from "./VideoBox";
import { AudioDataDecoder } from "./AudioDataDecoder";
import { AudioRenderer } from "./AudioRenderer";
import { VideoHelpers } from "./VideoHelpers";
import { eventsBus } from "./EventsBus";
import { VideoFrameChanger } from "./VideoFrameChanger";

const MAX_CAPACITY = 25;

interface VideoControllerState {
  playing: boolean;
}

interface VideoControllerProps {
  onEmit(state: Partial<VideoControllerState>): void;
}

// Low and high watermark for decode queue
// If the queue drops below the LWM, we try to fill it with up to HWM new frames
const decodeQueueLwm = 20;
const decodeQueueHwm = 30;

export class VideoController {
  private onEmit: VideoControllerProps["onEmit"];
  private frameDecoder: VideoFrameDecoder;
  private audioDataDecoder: AudioDataDecoder;
  private videoRenderer: VideoRenderer;
  private audioRenderer: AudioRenderer;

  private frameQueue: VideoFrame[] = [];
  private decodingVideoChunks: EncodedVideoChunk[] = [];
  private videoBoxes: VideoBox[] = [];
  private audioDataQueue: AudioData[] = [];
  private decodingAudioChunks: EncodedAudioChunk[] = [];
  private lastScheduledAudioFrameTime: number = -1;

  private playing = false;
  private currentTimeInS = 0;
  private lastAdvanceTimeInMs = 0;
  private totalDurationInS = 0;

  private advanceLoopId: number | null = null;
  private scheduleRenderId: number | null = null;

  private furthestDecodingVideoChunk: EncodedVideoChunk | null = null;
  private lastRenderedVideoFrameTs: number | null = null;

  private furthestDecodingAudioChunk: EncodedAudioChunk | null = null;

  private activeBoxForVideo: {
    prefixTs: number;
    box: VideoBox;
  } | null = null;

  private activeBoxForAudio: {
    prefixTs: number;
    box: VideoBox;
  } | null = null;

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
    this.audioDataDecoder = new AudioDataDecoder({
      onDecode: this.onDecodedAudioData,
    });
    this.videoRenderer = new VideoRenderer();
    this.audioRenderer = new AudioRenderer();
    this.frameChanger = new VideoFrameChanger();
  }

  setVideoBoxes = (videoBoxes: VideoBox[]) => {
    const nextBoxIds = new Set(videoBoxes.map((box) => box.id));
    let boxWasDeleted = false;

    this.videoBoxes.forEach((box) => {
      if (!nextBoxIds.has(box.id)) {
        boxWasDeleted = true;
      }
    });

    if (boxWasDeleted) {
      this.resetVideo();
      this.resetAudio();
    }

    this.videoBoxes = videoBoxes;
    const totalDuration = this.videoBoxes.reduce(
      (cur, box) => cur + box.getDurationInS(),
      0,
    );

    this.totalDurationInS = totalDuration;
    eventsBus.dispatch("totalDuration", totalDuration);

    if (this.videoBoxes.length > 0) {
      this.seek(this.currentTimeInS);
    } else {
      this.videoRenderer.clear();
      this.currentTimeInS = 0;
      eventsBus.dispatch("currentTime", this.currentTimeInS);
    }
  };

  setCanvasBox = (canvasBox: HTMLDivElement) => {
    this.videoRenderer.setCanvasBox(canvasBox);
  };

  setVideoSize = (size: VideoRendererRawSize) => {
    this.videoRenderer.setSize(size);
    this.lastRenderedVideoFrameTs = null;
    this.renderVideoFrame();
  };

  play = () => {
    this.lastAdvanceTimeInMs = performance.now();
    this.advanceLoopId = requestAnimationFrame((now) =>
      this.advanceCurrentTime(now),
    );
    this.playing = true;
    this.audioRenderer.resume();
    this.onEmit({ playing: true });
  };

  pause = () => {
    if (this.advanceLoopId) {
      cancelAnimationFrame(this.advanceLoopId);
      this.advanceLoopId = null;
    }

    this.playing = false;
    this.audioRenderer.suspend();
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
      this.resetAudio();
    }

    this.activeBoxForVideo = null;
    this.activeBoxForAudio = null;
    this.resetScheduleRenderId();
    this.lastRenderedVideoFrameTs = null;

    this.currentTimeInS = VideoHelpers.clampTime(
      timeInSeconds,
      this.totalDurationInS,
    );
    eventsBus.dispatch("currentTime", this.currentTimeInS);
    this.decodeVideoFrames();
    this.decodeAudio();
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
    this.decodeAudio();
    this.renderVideoFrame();
    this.renderAudio();

    if (reachedEnd) {
      this.pause();
    } else {
      this.advanceLoopId = requestAnimationFrame((now) =>
        this.advanceCurrentTime(now),
      );
    }
  }

  private decodeVideoFrames() {
    if (!this.activeBoxForVideo) {
      const activeBoxForVideo = this.getActiveBox();

      if (!activeBoxForVideo) return;
      this.activeBoxForVideo = activeBoxForVideo;
    }

    const videoBox = this.activeBoxForVideo.box;
    const prefixTimestamp = this.activeBoxForVideo.prefixTs;
    const range = videoBox.getRange();

    if (this.furthestDecodingVideoChunk === null) {
      // it can be negative when we are decoding frames of next track
      const dependenciesAtTs = Math.max(
        this.currentTimeInS - prefixTimestamp,
        0,
      );
      const videoChunksDependencies =
        videoBox.getVideoChunksDependencies(dependenciesAtTs);

      if (!videoChunksDependencies) return;

      this.decodeVideoChunks(
        videoChunksDependencies.chunks,
        videoChunksDependencies.codecConfig,
        prefixTimestamp,
        range.start,
        range.end,
      );

      const nextVideoChunks = videoBox.getNextVideoChunks(
        this.furthestDecodingVideoChunk!,
        1,
      );

      if (!nextVideoChunks || nextVideoChunks.chunks.length === 0) {
        this.frameDecoder.flush();
      }
    }

    const availableSpace =
      MAX_CAPACITY - (this.frameQueue.length + this.decodingVideoChunks.length);

    if (availableSpace > 0) {
      const nextVideoChunks = videoBox.getNextVideoChunks(
        this.furthestDecodingVideoChunk!,
        availableSpace,
      );

      if (!nextVideoChunks || nextVideoChunks.chunks.length === 0) {
        this.frameDecoder.flush();
        const nextVideoBox = this.getNextActiveVideoBox(videoBox);

        if (nextVideoBox) {
          this.activeBoxForVideo = nextVideoBox;
          this.furthestDecodingVideoChunk = null;
        }

        return;
      }

      this.decodeVideoChunks(
        nextVideoChunks.chunks,
        nextVideoChunks.codecConfig,
        prefixTimestamp,
        range.start,
        range.end,
      );
    }
  }

  private decodeVideoChunks(
    videoChunks: EncodedVideoChunk[],
    codecConfig: VideoDecoderConfig,
    prefixTimestamp: number,
    trackRangeStart: number,
    trackRangeEnd: number,
  ) {
    videoChunks.forEach((chunk) => {
      let timestamp;

      if (
        chunk.timestamp >= trackRangeStart * 1e6 &&
        chunk.timestamp < trackRangeEnd * 1e6
      ) {
        timestamp = chunk.timestamp + (prefixTimestamp - trackRangeStart) * 1e6;
      } else {
        // this chunk is used to decode other chunks with timestamp within range
        // therefore we need to instantly close decoded frame
        timestamp = -1;
      }

      const newChunk = VideoHelpers.recreateVideoChunk(chunk, {
        timestamp,
      });

      this.frameDecoder.decode(newChunk, codecConfig);
      this.decodingVideoChunks.push(newChunk);
    });
    this.furthestDecodingVideoChunk = videoChunks[videoChunks.length - 1];
  }

  private onDecodedVideoFrame = (videoFrame: VideoFrame) => {
    const currentTimeInMicros = Math.floor(1e6 * this.currentTimeInS);

    const decodingChunkIndex = this.decodingVideoChunks.findIndex((chunk) =>
      VideoHelpers.isFrameTimestampEqual(chunk, videoFrame),
    );

    if (decodingChunkIndex !== -1) {
      this.decodingVideoChunks.splice(decodingChunkIndex, 1);
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

  private onDecodedAudioData = (frame: AudioData) => {
    const decodingFrameIndex = this.decodingAudioChunks.findIndex((x) =>
      VideoHelpers.isFrameTimestampEqual(x, frame),
    );
    if (decodingFrameIndex < 0) {
      // Drop frames that are no longer in the decode queue.
      frame.close();
      return;
    }

    VideoHelpers.arrayRemoveAt(this.decodingAudioChunks, decodingFrameIndex);
    const currentTimeInMicros = Math.floor(1e6 * this.currentTimeInS);

    if (frame.timestamp + frame.duration! <= currentTimeInMicros) {
      frame.close();
      this.decodeAudio();
      return;
    }

    this.audioDataQueue.push(frame);
    this.decodeAudio();
  };

  private decodeAudio(): void {
    if (!this.activeBoxForAudio) {
      const activeAudioBox = this.getActiveBox();

      if (!activeAudioBox) return;
      this.activeBoxForAudio = activeAudioBox;
    }

    const videoBox = this.activeBoxForAudio.box;
    const prefixTimestamp = this.activeBoxForAudio.prefixTs;
    const range = videoBox.getRange();

    if (this.furthestDecodingAudioChunk === null) {
      // it can be negative when we are decoding frames of next track
      const dependenciesAtTs = Math.max(
        this.currentTimeInS - prefixTimestamp,
        0,
      );

      const audioChunksDependencies =
        videoBox.getAudioChunksDependencies(dependenciesAtTs);

      if (audioChunksDependencies === null) {
        this.activeBoxForAudio = this.getNextActiveVideoBox(videoBox);
        return;
      }

      this.processAudioDecodeQueue(
        audioChunksDependencies.chunks,
        audioChunksDependencies.codecConfig,
        prefixTimestamp,
        range.start,
      );
    }

    while (
      this.decodingAudioChunks.length + this.audioDataQueue.length <
      decodeQueueLwm
    ) {
      const nextAudioChunks = videoBox.getNextAudioChunks(
        this.furthestDecodingAudioChunk!,
        decodeQueueHwm -
          (this.decodingAudioChunks.length + this.audioDataQueue.length),
      );

      if (nextAudioChunks === null) {
        const nextVideoBox = this.getNextActiveVideoBox(videoBox);

        if (nextVideoBox) {
          this.activeBoxForAudio = nextVideoBox;
          this.furthestDecodingAudioChunk = null;
        }

        return;
      }

      this.processAudioDecodeQueue(
        nextAudioChunks.chunks,
        nextAudioChunks.codecConfig,
        prefixTimestamp,
        range.start,
      );
    }
  }

  private processAudioDecodeQueue(
    audioChunks: EncodedAudioChunk[],
    codecConfig: AudioDecoderConfig,
    prefixTimestamp: number,
    trackRangeStart: number,
  ): void {
    for (const chunk of audioChunks) {
      const newChunk = VideoHelpers.recreateAudioChunk(chunk, {
        timestamp: chunk.timestamp + (prefixTimestamp - trackRangeStart) * 1e6,
      });
      this.audioDataDecoder.decode(newChunk, codecConfig);
      this.decodingAudioChunks.push(newChunk);
    }

    this.furthestDecodingAudioChunk = audioChunks[audioChunks.length - 1];
  }

  private renderAudio() {
    const currentTimeInMicros = Math.floor(1e6 * this.currentTimeInS);

    // Drop all frames that are before current time, since we're too late to render them.
    for (let i = this.audioDataQueue.length - 1; i >= 0; i--) {
      const frame = this.audioDataQueue[i];
      if (frame.timestamp + frame.duration! < currentTimeInMicros) {
        frame.close();
        VideoHelpers.arrayRemoveAt(this.audioDataQueue, i);
      }
    }
    let nextFrameIndex: number = -1;
    if (this.lastScheduledAudioFrameTime >= 0) {
      // Render the next frame.
      nextFrameIndex = this.audioDataQueue.findIndex((frame) => {
        return frame.timestamp === this.lastScheduledAudioFrameTime;
      });
    }
    if (nextFrameIndex < 0) {
      // Render the frame at current time.
      nextFrameIndex = this.audioDataQueue.findIndex((frame) => {
        return (
          frame.timestamp <= currentTimeInMicros &&
          currentTimeInMicros < frame.timestamp + frame.duration
        );
      });
    }
    if (nextFrameIndex < 0) {
      // Decode more frames (if we now have more space in the queue)
      this.decodeAudio();
      return;
    }
    // Collect as many consecutive audio frames as possible
    // to schedule in a single batch.
    const firstFrame = this.audioDataQueue[nextFrameIndex];
    const frames: AudioData[] = [firstFrame];
    for (
      let frameIndex = nextFrameIndex + 1;
      frameIndex < this.audioDataQueue.length;
      frameIndex++
    ) {
      const frame = this.audioDataQueue[frameIndex];
      const previousFrame = frames[frames.length - 1];
      if (
        VideoHelpers.isConsecutiveAudioFrame(previousFrame, frame) &&
        frame.format === firstFrame.format &&
        frame.numberOfChannels === firstFrame.numberOfChannels &&
        frame.sampleRate === firstFrame.sampleRate
      ) {
        // This frame is consecutive with the previous frame.
        frames.push(frame);
      } else {
        // This frame is not consecutive. We can't schedule this in the same batch.
        break;
      }
    }

    this.audioRenderer.process(frames, currentTimeInMicros);
    const lastFrame = frames[frames.length - 1];
    this.lastScheduledAudioFrameTime = lastFrame.timestamp + lastFrame.duration;
    // Close the frames, so the audio decoder can reclaim them.
    for (let i = frames.length - 1; i >= 0; i--) {
      const frame = frames[i];
      frame.close();
      VideoHelpers.arrayRemove(this.audioDataQueue, frame);
    }
    // Decode more frames (if we now have more space in the queue)
    this.decodeAudio();
  }

  private getActiveVideoBoxAt(timeInS: number) {
    let videoBox: VideoBox | null = null;
    let prefixTimestamp = 0;

    for (let i = 0; i < this.videoBoxes.length; i++) {
      if (
        prefixTimestamp <= timeInS &&
        timeInS <= this.videoBoxes[i].getDurationInS() + prefixTimestamp
      ) {
        videoBox = this.videoBoxes[i];
        break;
      }
      prefixTimestamp += this.videoBoxes[i].getDurationInS();
    }

    if (!videoBox) return null;
    return { prefixTs: prefixTimestamp, box: videoBox };
  }

  private getActiveBox() {
    return this.getActiveVideoBoxAt(this.currentTimeInS);
  }

  private getNextActiveVideoBox(videoBox: VideoBox) {
    const boxIndex = this.videoBoxes.findIndex(
      (track) => track.id === videoBox.id,
    );

    const nextBoxIndex = boxIndex + 1;
    if (nextBoxIndex >= this.videoBoxes.length) return null;

    const nextBox = this.videoBoxes[nextBoxIndex];
    const prefixTs = this.videoBoxes
      .slice(0, nextBoxIndex)
      .reduce((acc, track) => acc + track.getDurationInS(), 0);

    return { prefixTs, box: nextBox };
  }

  private renderVideoFrame() {
    this.resetScheduleRenderId();

    const currentTimeInMicros = Math.floor(1e6 * this.currentTimeInS);

    this.frameQueue = this.frameQueue.filter((frame) => {
      if (frame.timestamp + frame.duration! < currentTimeInMicros) {
        frame.close();
        return false;
      }
      return true;
    });

    const currentFrameIndex = this.frameQueue.findIndex((frame) => {
      return VideoHelpers.isChunkInTime(frame, currentTimeInMicros);
    });

    if (currentFrameIndex !== -1) {
      const currentFrame = this.frameQueue[currentFrameIndex];

      if (this.lastRenderedVideoFrameTs !== currentFrame.timestamp) {
        const timestampInS = Math.max(0, currentFrame.timestamp / 1e6);
        const videoBox = this.getActiveVideoBoxAt(timestampInS);

        if (!videoBox) return;

        const processedFrame = this.frameChanger.processFrame(
          currentFrame,
          videoBox.box.getEffects(),
        );
        this.videoRenderer.draw(processedFrame);
        processedFrame.close();
        this.lastRenderedVideoFrameTs = currentFrame.timestamp;
      }
    }
  }

  private resetVideo() {
    this.furthestDecodingVideoChunk = null;
    this.frameDecoder.reset();
    this.frameQueue.forEach((frame) => frame.close());
    this.frameQueue = [];
    this.decodingVideoChunks = [];
    this.activeBoxForVideo = null;
  }

  private resetAudio() {
    this.furthestDecodingAudioChunk = null;
    this.audioDataDecoder.reset();
    this.audioDataQueue.forEach((frame) => frame.close());
    this.audioDataQueue = [];
    this.decodingAudioChunks = [];
    this.lastScheduledAudioFrameTime = -1;
    this.audioRenderer.reset();
    this.activeBoxForAudio = null;
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
