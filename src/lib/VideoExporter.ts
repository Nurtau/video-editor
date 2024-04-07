import { createFile, type MP4File } from "mp4box";

import { VideoHelpers } from "./VideoHelpers";
import { VideoFrameChanger } from "./VideoFrameChanger";
import { VideoBox } from "./VideoBox";

/*
 * IN SAFARI: exported video is huge in memory because chunk type is always key
 */

const KEYFRAME_INTERVAL_MICROSECONDS = 4 * 1000 * 1000; // 4 seconds
const TIMESCALE = 90000;

interface VideoOptions {
  width: number;
  height: number;
}

interface CommonConfig {
  codec: string;
  width: number;
  height: number;
}

const QUEUE_WINDOW = 20;
const MIN_QUEUE_THRESHOLD = 5;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface VideoExportProgressState {
  showProgress: boolean;
  exported: boolean;
  maxEncodedNums: number;
  curEncodedNums: number;
}

interface VideoExporterProps {
  onEmit(state: Partial<VideoExportProgressState>): void;
}

export class VideoExporter {
  private onEmit: VideoExporterProps["onEmit"];
  private decoder: VideoDecoder;
  private encoder: VideoEncoder;
  private commonConfig: CommonConfig | null = null;
  private nextKeyframeTs = 0;
  private mp4File: MP4File;
  private trackId: number | null = null;
  private frameChanger: VideoFrameChanger;
  private videoBoxes: VideoBox[] = [];
  private encodingNums = 0;
  private encodedNums = 0;
  private videoDecoderConfig: VideoDecoderConfig | null = null;

  static getDefaultState(): VideoExportProgressState {
    // just random numbers for initial state
    return {
      showProgress: false,
      exported: false,
      curEncodedNums: 0,
      maxEncodedNums: 100,
    };
  }

  constructor({ onEmit }: VideoExporterProps) {
    this.onEmit = onEmit;
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

  exportVideo = async (boxes: VideoBox[], options: VideoOptions) => {
    this.reset();
    this.videoBoxes = boxes;

    if (this.videoBoxes.length === 0) return;

    const maxEncodedNums = this.extractEncodingFramesNum(boxes);

    this.onEmit({
      showProgress: true,
      exported: false,
      curEncodedNums: 0,
      maxEncodedNums,
    });

    const config: CommonConfig = {
      codec: "avc1.4d0034",
      height: options.height,
      width: options.width,
    };
    this.commonConfig = config;

    this.encoder.configure({
      ...config,
      hardwareAcceleration: "prefer-hardware",
    });

    let prefixTs = 0;
    let videoBoxIndex = 0;
    let furthestDecodingVideoChunk: EncodedVideoChunk | null = null;

    while (videoBoxIndex < this.videoBoxes.length) {
      const videoBox = this.videoBoxes[videoBoxIndex];
      const range = videoBox.getRange();

      let decodingChunks;

      if (!furthestDecodingVideoChunk) {
        decodingChunks = videoBox.getVideoChunksDependencies(0);
      } else {
        decodingChunks = videoBox.getNextVideoChunks(
          furthestDecodingVideoChunk,
          QUEUE_WINDOW,
        );
      }

      if (!decodingChunks) {
        videoBoxIndex += 1;
        prefixTs += videoBox.getDurationInS();
        furthestDecodingVideoChunk = null;
      } else {
        const { chunks, codecConfig } = decodingChunks;

        if (this.videoDecoderConfig !== codecConfig) {
          this.decoder.configure(codecConfig);
          this.videoDecoderConfig = codecConfig;
        }

        chunks.forEach((chunk) => {
          let timestamp;

          if (
            chunk.timestamp >= range.start * 1e6 &&
            chunk.timestamp < range.end * 1e6
          ) {
            timestamp = chunk.timestamp + (prefixTs - range.start) * 1e6;
            this.encodingNums += 1;
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

        furthestDecodingVideoChunk = chunks[chunks.length - 1];

        while (this.encodingNums >= MIN_QUEUE_THRESHOLD) {
          await sleep(16);
        }

        this.onEmit({
          curEncodedNums: this.encodedNums,
        });
      }
    }

    await this.decoder.flush();
    await this.encoder.flush();

    this.onEmit({
      exported: true,
      curEncodedNums: maxEncodedNums,
    });
  };

  download = () => {
    this.mp4File.save("video.mp4");
  };

  reset = () => {
    this.decoder.reset();
    this.encoder.reset();
    this.mp4File = createFile();
    this.trackId = null;
    this.nextKeyframeTs = 0;
    this.encodedNums = 0;
    this.encodingNums = 0;
    this.videoDecoderConfig = null;
  };

  private extractEncodingFramesNum = (boxes: VideoBox[]) => {
    let framesNum = 0;

    boxes.forEach((box) => {
      const range = box.getRange();

      box.getVideoTrackBuffers().forEach((buffer) => {
        buffer.getVideoChunksGroups().forEach((group) => {
          group.videoChunks.forEach((chunk) => {
            if (
              chunk.timestamp >= range.start * 1e6 &&
              chunk.timestamp < range.end * 1e6
            ) {
              framesNum += 1;
            }
          });
        });
      });
    });

    return framesNum;
  };

  private onDecode = async (frame: VideoFrame) => {
    if (frame.timestamp < 0) {
      frame.close();
      return;
    }

    const videoBox = this.getActiveVideoBoxAt(frame.timestamp / 1e6);

    if (!videoBox) {
      throw new Error(
        "Internal error: videoTrack for decoded frame must present",
      );
    }

    const processedFrame = this.frameChanger.processFrame(
      frame,
      videoBox.getEffects(),
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

    this.encodingNums -= 1;
    this.encodedNums += 1;

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

    return videoBox;
  }
}
