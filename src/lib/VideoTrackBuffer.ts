import { type MP4Sample } from "mp4box";

interface VideoChunksGroup {
  start: number;
  end: number;
  videoChunks: EncodedVideoChunk[];
  codecConfig: VideoDecoderConfig;
}

export class VideoTrackBuffer {
  private videoChunksGroup: VideoChunksGroup[] = [];

  constructor(samples: MP4Sample[], videoDecoderConfig: VideoDecoderConfig) {
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
          codecConfig: videoDecoderConfig,
        };
        this.videoChunksGroup.push(currentFramesGroup);
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

  getVideoChunksData(time: number) {
    const timeInMicros = Math.floor(time * 1e6);

    const containingFramesGroup = this.videoChunksGroup.find((group) => {
      return group.start <= timeInMicros && timeInMicros < group.end;
    });

    if (!containingFramesGroup) return null;

    return {
      videoChunks: containingFramesGroup.videoChunks,
      codecConfig: containingFramesGroup.codecConfig,
    };
  }
}
