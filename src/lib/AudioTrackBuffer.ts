import { type MP4Sample, type MP4AudioTrack } from "mp4box";

import { VideoHelpers } from "./VideoHelpers";

export interface AudioDecodeQueue {
  frames: EncodedAudioChunk[];
  codecConfig: AudioDecoderConfig;
}

export class AudioTrackBuffer {
  private audioChunks: EncodedAudioChunk[] = [];
  private codecConfig: AudioDecoderConfig;
  private durationInS: number;

  constructor(
    track: MP4AudioTrack,
    samples: MP4Sample[],
    audioDecoderConfig: AudioDecoderConfig,
  ) {
    this.durationInS = track.duration / track.timescale;
    this.codecConfig = audioDecoderConfig;

    this.audioChunks = samples.map((sample) => {
      return new EncodedAudioChunk({
        timestamp: (1e6 * sample.cts) / sample.timescale,
        duration: (1e6 * sample.duration) / sample.timescale,
        data: sample.data,
        type: sample.is_sync ? "key" : "delta",
      });
    });
    this.audioChunks.sort((left, right) => left.timestamp - right.timestamp);
  }

  hasFrame(frame: EncodedAudioChunk): boolean {
    return this.audioChunks.includes(frame);
  }

  getAudioChunksDependencies = (time: number) => {
    const timeInMicros = Math.floor(time * 1e6);

    const audioChunk = this.audioChunks.find((chunk) => {
      return VideoHelpers.isChunkInTime(chunk, timeInMicros);
    });

    if (!audioChunk) return null;

    return [audioChunk];
  };

  getNextAudioChunks = (
    audioChunk: EncodedAudioChunk,
    maxAmount: number,
    rangeEndInS: number,
  ) => {
    const chunkIndex = this.audioChunks.indexOf(audioChunk);

    if (chunkIndex === -1) return null;

    const nextAudioChunkIndex = chunkIndex + 1;

    const nextAudioChunks = this.audioChunks
      .slice(nextAudioChunkIndex, nextAudioChunkIndex + maxAmount)
      .filter((chunk) => chunk.timestamp + chunk.duration! < rangeEndInS * 1e6);

    if (nextAudioChunks.length === 0) {
      return null;
    }

    return nextAudioChunks;
  };

  getCodecConfig = () => {
    return this.codecConfig;
  };

  getDurationInS = () => {
    return this.durationInS;
  };
}
