import { type MP4Sample } from "mp4box";
import { VideoHelpers } from "./VideoHelpers";

import { generateId } from "./helpers";

interface VideoChunksGroup {
  start: number;
  end: number;
  videoChunks: EncodedVideoChunk[];
}

export interface VideoEffects {
  blur: number;
  opacity: number;
}

interface NewDataProps {
  samples: MP4Sample[];
  videoDecoderConfig: VideoDecoderConfig;
}

export class VideoTrackBuffer {
  private videoChunksGroups: VideoChunksGroup[] = [];
  private codecConfig: VideoDecoderConfig;
  private range = {
    maxEnd: 0,
    start: 0,
    end: 0,
  };

  private effects: VideoEffects = {
    blur: 0,
    opacity: 100,
  };

  public id = generateId();

  constructor(props: NewDataProps | VideoTrackBuffer) {
    if (props instanceof VideoTrackBuffer) {
      this.videoChunksGroups = props.getVideoChunksGroups();
      this.codecConfig = props.getCodecConfig();
      this.range = props.getRange();
    } else {
      const { samples, videoDecoderConfig } = props;

      this.populateChunkGroups(samples);
      this.codecConfig = videoDecoderConfig;

      if (this.videoChunksGroups.length > 0) {
        const duration =
          this.videoChunksGroups[this.videoChunksGroups.length - 1].end /
          1_000_000;
        this.range.maxEnd = duration;
        this.range.end = duration;
      }
    }
  }

  copy(): VideoTrackBuffer {
    return new VideoTrackBuffer(this);
  }

  getVideoChunksDependencies = (time: number) => {
    const timeInMicros = Math.floor(time * 1e6);

    const containingGroup = this.videoChunksGroups.find((group) => {
      return group.start <= timeInMicros && timeInMicros <= group.end;
    });

    if (!containingGroup) return null;

    const frameIndexAtTime = containingGroup.videoChunks.findIndex((chunk) => {
      return VideoHelpers.isChunkInTime(chunk, timeInMicros);
    });

    if (frameIndexAtTime === -1) return null;

    // in Chrome: when frame is decoded, always 2 frames are not decoded
    // they are decoded only after flush()
    // therefore we need to overslice dependencies
    // to optimistically leave non-needed chunk not decoded
    const overIndexes = 10;
    return containingGroup.videoChunks.slice(0, frameIndexAtTime + overIndexes);
  };

  getNextVideoChunks = (videoChunk: EncodedVideoChunk, maxAmount: number) => {
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
  };

  getCodecConfig = () => {
    return this.codecConfig;
  };

  getVideoChunksGroups = () => {
    return this.videoChunksGroups;
  };

  getDuration = () => {
    return this.range.end - this.range.start;
  };

  getRange = () => {
    return this.range;
  };

  getEffects = () => {
    return this.effects;
  };

  updateEffects = (newEffects: Partial<VideoEffects>) => {
    this.effects = { ...this.effects, ...newEffects };
  };

  private populateChunkGroups(samples: MP4Sample[]) {
    let currentFramesGroup: VideoChunksGroup | null = null;

    let shifted = 0;
    let isFirst = true;

    for (const sample of samples) {
      let timestamp = (sample.cts * 1_000_000) / sample.timescale;
      const duration = (sample.duration * 1_000_000) / sample.timescale;

      // @TODO: first frame does not start at 0: this is quick workaround
      // learn more about it and find if there is a better solution

      if (isFirst) {
        shifted = timestamp;
        isFirst = false;
        timestamp = 0;
      } else {
        timestamp -= shifted;
      }

      const frame = new EncodedVideoChunk({
        type: sample.is_sync ? "key" : "delta",
        timestamp,
        duration,
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
}
