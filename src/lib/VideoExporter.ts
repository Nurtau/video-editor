import { createFile, type MP4File } from "mp4box";

import { VideoTrackBuffer, type VideoEffects } from "./VideoTrackBuffer";

/*
 * IN SAFARI: exported video is huge in memory because chunk type is always key
 */

// @TODO: what about asking user about this number?
const KEYFRAME_INTERVAL_MICROSECONDS = 4 * 1000 * 1000; // 4 seconds
const TIMESCALE = 90000;

interface CommonConfig {
  codec: string;
  width: number;
  height: number;
}

// @TODO: show UI progress with percentage maybe
export class VideoExporter {
  private decoder: VideoDecoder;
  private encoder: VideoEncoder;
  private commonConfig: CommonConfig | null = null;
  private nextKeyframeTs = 0;
  private mp4File: MP4File;
  private trackId: number | null = null;
  private processFrame: (
    frame: VideoFrame,
    effects: VideoEffects,
  ) => VideoFrame;

  constructor({
    processFrame,
  }: {
    processFrame: VideoExporter["processFrame"];
  }) {
    this.mp4File = createFile();
    this.decoder = new VideoDecoder({
      output: this.onDecode,
      error: console.log,
    });
    this.encoder = new VideoEncoder({
      output: this.onEncode,
      error: console.log,
    });
    this.processFrame = processFrame;
  }

  exportVideo = async (buffers: VideoTrackBuffer[]) => {
    this.reset();
    if (buffers.length === 0) return;

    // @TODO: on multiples videos, all buffers config should be considered
    const firstBufferConfig = buffers[0].getCodecConfig();
    const config: CommonConfig = {
      codec: firstBufferConfig.codec,
      height: firstBufferConfig.codedHeight ?? 0,
      width: firstBufferConfig.codedWidth ?? 0,
    };
    this.commonConfig = config;

    this.encoder.configure({
      ...config,
      hardwareAcceleration: "prefer-hardware",
    });

    for (const buffer of buffers) {
      for (const group of buffer.getVideoChunksGroups()) {
        const config = buffer.getCodecConfig();
        this.decoder.configure(config);

        for (const chunk of group.videoChunks) {
          this.decoder.decode(chunk);
        }

        await this.decoder.flush();
      }
    }

    await this.encoder.flush();
    this.mp4File.save("mp4box.mp4");
  };

  private onDecode = async (frame: VideoFrame) => {
    let keyFrame = false;
    
    // @TODO: fix this moment, when reimplementing VideoExporter
    const processedFrame = this.processFrame(frame, null as any);

    if (processedFrame.timestamp >= this.nextKeyframeTs) {
      keyFrame = true;
      this.nextKeyframeTs =
        processedFrame.timestamp + KEYFRAME_INTERVAL_MICROSECONDS;
    }

    this.encoder.encode(processedFrame, { keyFrame });
    processedFrame.close();
  };

  private onEncode = (
    chunk: EncodedVideoChunk,
    metadata?: EncodedVideoChunkMetadata,
  ) => {
    if (!this.commonConfig) {
      throw new Error("INTERNAL ERROR: commonConfig must be defined");
    }

    if (this.trackId === null) {
      const description = metadata!.decoderConfig!.description;
      this.trackId = this.mp4File.addTrack({
        width: this.commonConfig.width,
        height: this.commonConfig.height,
        timescale: TIMESCALE,
        avcDecoderConfigRecord: description,
      });
    }

    const uint8 = new Uint8Array(chunk.byteLength);
    chunk.copyTo(uint8);

    const sampleDuration = (chunk.duration! * TIMESCALE) / 1_000_000;

    this.mp4File.addSample(this.trackId, uint8, {
      duration: sampleDuration,
      is_sync: chunk.type === "key",
    });
  };

  private reset() {
    this.decoder.reset();
    this.encoder.reset();
    this.mp4File = createFile();
    this.trackId = null;
    this.nextKeyframeTs = 0;
  }
}
