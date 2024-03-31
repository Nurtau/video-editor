import { type MP4Sample, type MP4AudioTrack } from "mp4box";

import { VideoHelpers } from "./VideoHelpers";
import { generateId } from "~/lib/helpers";

export interface AudioDecodeQueue {
  frames: EncodedAudioChunk[];
  codecConfig: AudioDecoderConfig;
}

export class AudioTrackBuffer {
  private audioChunks: EncodedAudioChunk[] = [];
  private codecConfig: AudioDecoderConfig;
  private range = {
    maxEnd: 0,
    start: 0,
    end: 0,
  };

  public id = generateId();

  constructor(
    track: MP4AudioTrack,
    samples: MP4Sample[],
    audioDecoderConfig: AudioDecoderConfig,
  ) {
    const duration = track.duration / track.timescale;
    this.range.maxEnd = duration;
    this.range.end = duration;
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

  getAudioChunksDependencies = (time: number) => {
    const timeInMicros = Math.floor(time * 1e6);

    const audioChunk = this.audioChunks.find((chunk) => {
      return VideoHelpers.isChunkInTime(chunk, timeInMicros);
    });

    if (!audioChunk) return null;

    return [audioChunk];
  };

  hasFrame(frame: EncodedAudioChunk): boolean {
    return this.audioChunks.includes(frame);
  }

  getNextAudioChunks = (audioChunk: EncodedAudioChunk, maxAmount: number) => {
    const chunkIndex = this.audioChunks.indexOf(audioChunk);
    const nextAudioChunkIndex = chunkIndex + 1;
    return this.audioChunks.slice(
      nextAudioChunkIndex,
      nextAudioChunkIndex + maxAmount,
    );
  };

  getCodecConfig = () => {
    return this.codecConfig;
  };

  getDuration = () => {
    return this.range.end - this.range.start;
  };
}
