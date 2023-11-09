import { type MP4Sample } from "mp4box";

import { VideoHelpers } from "./VideoHelpers";

interface VideoChunksGroup {
  start: number;
  end: number;
  videoChunks: EncodedVideoChunk[];
}

export class VideoTrackBuffer {
  private videoChunksGroups: VideoChunksGroup[] = [];
  private codecConfig: VideoDecoderConfig;
  // @TODO: add a duration field

  constructor(samples: MP4Sample[], videoDecoderConfig: VideoDecoderConfig) {
    this.codecConfig = videoDecoderConfig;
    let currentFramesGroup: VideoChunksGroup | null = null;

    for (const sample of samples) {
      const frame = new EncodedVideoChunk({
        type: sample.is_sync ? "key" : "delta",
        timestamp: (sample.cts * 1_000_000) / sample.timescale,
        duration: (sample.duration * 1_000_000) / sample.timescale,
        data: sample.data,
      });

      const frameEndTs = frame.timestamp + frame.duration!;

      if (currentFramesGroup === null || frame.type === "key") {
        currentFramesGroup = {
          start: frame.timestamp,
          end: frameEndTs,
          videoChunks: [frame],
        };
        this.videoChunksGroups.push(currentFramesGroup);
      } else {
        currentFramesGroup.videoChunks.push(frame);
        currentFramesGroup.start = Math.min(
          currentFramesGroup.start,
          frame.timestamp,
        );
        currentFramesGroup.end = Math.max(currentFramesGroup.end, frameEndTs);
      }
    }
  }

  getVideoChunksDependencies(time: number) {
    const timeInMicros = Math.floor(time * 1e6);

    const containingGroup = this.videoChunksGroups.find((group) => {
      return group.start <= timeInMicros && timeInMicros < group.end;
    });

    if (!containingGroup) return null;

    const frameIndexAtTime = containingGroup.videoChunks.findIndex((chunk) => {
      return VideoHelpers.isChunkInTime(chunk, timeInMicros);
    });

    return containingGroup.videoChunks.slice(0, frameIndexAtTime + 1);
  }

  getNextVideoChunks(videoChunk: EncodedVideoChunk, maxAmount: number) {
    const containingGroupIndex = this.videoChunksGroups.findIndex((group) => {
      return group.videoChunks.includes(videoChunk);
    });

    if (containingGroupIndex === -1) return null;

    const containingGroup = this.videoChunksGroups[containingGroupIndex];
    const chunkIndex = containingGroup.videoChunks.indexOf(videoChunk);

    if (chunkIndex === containingGroup.videoChunks.length - 1) {
      // it means that we need to take next video chunks from next videoChunkGroup
      if (containingGroupIndex + 1 < this.videoChunksGroups.length) {
        const nextContainingGroup =
          this.videoChunksGroups[containingGroupIndex + 1];

        return nextContainingGroup.videoChunks.slice(0, maxAmount);
      }
    } else {
      const nextVideoChunkIndex = chunkIndex + 1;
      return containingGroup.videoChunks.slice(
        nextVideoChunkIndex,
        nextVideoChunkIndex + maxAmount,
      );
    }
  }

  getCodecConfig() {
    return this.codecConfig;
  }

  getVideoChunksGroups() {
    return this.videoChunksGroups;
  }
}
