import { createFile, type MP4File } from "mp4box";

import { VideoHelpers } from "./VideoHelpers";
import { VideoFrameChanger } from "./VideoFrameChanger";
import { VideoTrackBuffer } from "./VideoTrackBuffer";

/*
 * IN SAFARI: exported video is huge in memory because chunk type is always key
 */

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
  private frameChanger: VideoFrameChanger;
  private videoTrackBuffers: VideoTrackBuffer[] = [];

  constructor() {
    this.frameChanger = new VideoFrameChanger();
    this.mp4File = createFile();
    this.decoder = new VideoDecoder({
      output: this.onDecode,
      error: console.log,
    });
    this.encoder = new VideoEncoder({
      output: this.onEncode,
      error: console.log,
    });
  }

  exportVideo = async (buffers: VideoTrackBuffer[]) => {
    this.reset();
    this.videoTrackBuffers = buffers;
    if (this.videoTrackBuffers.length === 0) return;

    // @NOW: this should be input from user
    const config: CommonConfig = {
      codec: "avc1.4d0034",
      height: 1080,
      width: 1920,
    };
    this.commonConfig = config;

    this.encoder.configure({
      ...config,
      hardwareAcceleration: "prefer-hardware",
    });

    let prefixTs = 0;
    let videoTrackIndex = 0;
    let furthestDecodingVideoChunk: EncodedVideoChunk | null = null;

    while (videoTrackIndex < this.videoTrackBuffers.length) {
      const buffer = this.videoTrackBuffers[videoTrackIndex];
      const range = buffer.getRange();

      let decodingChunks;

      if (!furthestDecodingVideoChunk) {
        this.decoder.configure(buffer.getCodecConfig());
        decodingChunks = buffer.getVideoChunksDependencies(0);
      } else {
        decodingChunks = buffer.getNextVideoChunks(
          furthestDecodingVideoChunk,
          10,
        );
      }

      if (!decodingChunks) {
        videoTrackIndex += 1;
        prefixTs += buffer.getDuration();
        furthestDecodingVideoChunk = null;
      } else {
        decodingChunks.forEach((chunk) => {
          let timestamp;

          if (
            chunk.timestamp >= range.start * 1e6 &&
            chunk.timestamp < range.end * 1e6
          ) {
            timestamp = chunk.timestamp + (prefixTs - range.start) * 1e6;
          } else {
            // this chunk is used to decode other chunks with timestamp within range
            // therefore we need to instantly close decoded frame
            timestamp = -1;
          }

          const updatedChunk = VideoHelpers.recreateVideoChunk(chunk, {
            timestamp,
          });

          this.decoder.decode(updatedChunk);
        });

        furthestDecodingVideoChunk = decodingChunks[decodingChunks.length - 1];
        // @NOW: memory usage optimisation: what about frame/chunk windowing
      }
    }

    await this.decoder.flush();
    await this.encoder.flush();
    this.mp4File.save("mp4box.mp4");
  };

  private onDecode = async (frame: VideoFrame) => {
    if (frame.timestamp < 0) {
      frame.close();
      return;
    }

    const videoTrack = this.getActiveVideoTrackAt(frame.timestamp / 1e6);

    if (!videoTrack) {
      throw new Error(
        "Internal error: videoTrack for decoded frame must present",
      );
    }

    const processedFrame = this.frameChanger.processFrame(
      frame,
      videoTrack.getEffects(),
    );

    frame.close();

    let keyFrame = false;
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

  private getActiveVideoTrackAt(timeInS: number) {
    let trackBuffer: VideoTrackBuffer | null = null;
    let prefixTimestamp = 0;

    for (let i = 0; i < this.videoTrackBuffers.length; i++) {
      if (
        prefixTimestamp <= timeInS &&
        timeInS <= this.videoTrackBuffers[i].getDuration() + prefixTimestamp
      ) {
        trackBuffer = this.videoTrackBuffers[i];
        break;
      }
      prefixTimestamp += this.videoTrackBuffers[i].getDuration();
    }

    return trackBuffer;
  }

  private reset() {
    this.decoder.reset();
    this.encoder.reset();
    this.mp4File = createFile();
    this.trackId = null;
    this.nextKeyframeTs = 0;
  }
}
