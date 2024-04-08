import { type MP4Sample } from "mp4box";
import { VideoHelpers } from "./VideoHelpers";

interface VideoChunksGroup {
  start: number;
  end: number;
  videoChunks: EncodedVideoChunk[];
}

interface VideoTrackBufferProps {
  samples: MP4Sample[];
  videoDecoderConfig: VideoDecoderConfig;
}

export class VideoTrackBuffer {
  private videoChunksGroups: VideoChunksGroup[] = [];
  private codecConfig: VideoDecoderConfig;

  constructor(props: VideoTrackBufferProps) {
    const { samples, videoDecoderConfig } = props;

    this.populateChunkGroups(samples);
    this.codecConfig = videoDecoderConfig;
  }

  getVideoChunksDependencies = (timeInS: number) => {
    const timeInMicros = timeInS * 1e6;

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

  getNextVideoChunks = (
    videoChunk: EncodedVideoChunk,
    maxAmount: number,
    rangeEndInS: number,
  ) => {
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

        if (
          !this.groupIncludesChunkWithinRange(
            nextContainingGroup,
            0,
            rangeEndInS,
          )
        ) {
          return null;
        }

        return nextContainingGroup.videoChunks.slice(0, maxAmount);
      }
    } else {
      const nextVideoChunkIndex = chunkIndex + 1;

      if (
        !this.groupIncludesChunkWithinRange(
          containingGroup,
          nextVideoChunkIndex,
          rangeEndInS,
        )
      ) {
        return null;
      }

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

  getDurationInS = () => {
    if (this.videoChunksGroups.length === 0) return 0;

    return (
      this.videoChunksGroups[this.videoChunksGroups.length - 1].end / 1_000_000
    );
  };

  private groupIncludesChunkWithinRange(
    group: VideoChunksGroup,
    startIndex: number,
    rangeEndInS: number,
  ) {
    let includes = false;

    group.videoChunks.slice(startIndex).forEach((chunk) => {
      if (chunk.timestamp < rangeEndInS * 1e6) {
        includes = true;
      }
    });

    return includes;
  }

  private populateChunkGroups(samples: MP4Sample[]) {
    let currentFramesGroup: VideoChunksGroup | null = null;

    let shifted = 0;
    let isFirst = true;

    for (const sample of samples) {
      let timestamp = (sample.cts * 1_000_000) / sample.timescale;
      const duration = (sample.duration * 1_000_000) / sample.timescale;

      // First frame does not start at 0: this is quick workaround
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
