import { ISOFile } from "mp4box";

import { VideoHelpers } from "../VideoHelpers";
import { VideoFrameChanger } from "../VideoFrameChanger";
import { VideoBox } from "../VideoBox";
import {
  addSample,
  addTrak,
  createMP4File,
  VIDEO_TIMESCALE,
  AUDIO_TIMESCALE,
} from "./MP4BoxHelpers";

/*
 * IN SAFARI: exported video is huge in memory because chunk type is always key
 */
const KEYFRAME_INTERVAL_MICROSECONDS = 4 * 1000 * 1000; // 4 seconds

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
const INITIAL_CHUNK_OFFSET = 40;

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

/*
  VideoExporter has flaws:
    - audio is not resampled, therefore audio with different sample rate turns slower or faster
    - works incorrectly with videos without audio tracks, existing tracks shift to the left to fill empty space
*/

export class VideoExporter {
  private onEmit: VideoExporterProps["onEmit"];
  private videoDecoder: VideoDecoder;
  private videoEncoder: VideoEncoder;
  private videoCommonConfig: CommonConfig | null = null;
  private videoDecoderConfig: VideoDecoderConfig | null = null;
  private nextKeyframeTs = 0;
  private mp4File: typeof ISOFile;
  private videoTrackId: number | null = null;
  private frameChanger: VideoFrameChanger;
  private videoBoxes: VideoBox[] = [];
  private encodingNums = 0;
  private encodedNums = 0;

  private audioTrackId: number | null = null;

  private chunkOffset = INITIAL_CHUNK_OFFSET;
  private isFirstVideoSample = true;

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
    this.mp4File = createMP4File();
    this.videoDecoder = new VideoDecoder({
      output: this.onVideoDecode,
      error: console.log,
    });
    this.videoEncoder = new VideoEncoder({
      output: this.onVideoEncode,
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
    this.videoCommonConfig = config;

    this.videoEncoder.configure({
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
          this.videoDecoder.configure(codecConfig);
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

          this.videoDecoder.decode(updatedChunk);
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

    await this.videoDecoder.flush();
    await this.videoEncoder.flush();

    prefixTs = 0;
    videoBoxIndex = 0;

    let firstMp4aBox: any = null;
    const allChunks: EncodedAudioChunk[] = [];

    while (videoBoxIndex < this.videoBoxes.length) {
      const videoBox = this.videoBoxes[videoBoxIndex];
      const range = videoBox.getRange();

      for (const audioTrack of videoBox.getAudioTrackBuffers().slice(0, 1)) {
        const chunks = audioTrack
          .getAudioChunks()
          .filter(
            (chunk) =>
              chunk.timestamp / 1e6 >= range.start &&
              (chunk.timestamp + chunk.duration!) / 1e6 <= range.end,
          )
          .map((chunk) =>
            VideoHelpers.recreateAudioChunk(chunk, {
              timestamp: chunk.timestamp + (prefixTs - range.start) * 1e6,
            }),
          );

        if (chunks.length) {
          firstMp4aBox = audioTrack.getMp4aBox();
        }

        allChunks.push(...chunks);
      }

      prefixTs += videoBox.getDurationInS();
      videoBoxIndex += 1;
    }

    if (allChunks.length > 0) {
      this.processAudioChunks(allChunks, firstMp4aBox);
    }

    this.onEmit({
      exported: true,
      curEncodedNums: maxEncodedNums,
    });
  };

  download = () => {
    this.mp4File.save("video.mp4");
  };

  reset = () => {
    this.videoDecoder.reset();
    this.videoEncoder.reset();

    this.videoDecoderConfig = null;

    this.videoTrackId = null;
    this.audioTrackId = null;

    this.mp4File = createMP4File();
    this.nextKeyframeTs = 0;
    this.encodedNums = 0;
    this.encodingNums = 0;

    this.chunkOffset = INITIAL_CHUNK_OFFSET;
    this.isFirstVideoSample = true;
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

  private processAudioChunks = (chunks: EncodedAudioChunk[], mp4aBox: any) => {
    if (this.audioTrackId === null) {
      this.audioTrackId = addTrak(this.mp4File, {
        type: "audio",
        mp4a: mp4aBox,
      });
    }

    chunks.forEach((chunk) => {
      const uint8 = new Uint8Array(chunk.byteLength);
      chunk.copyTo(uint8);

      const sampleDuration = (chunk.duration! * AUDIO_TIMESCALE) / 1_000_000;

      this.chunkOffset = addSample(
        this.mp4File,
        this.audioTrackId,
        uint8,
        chunk.type === "key",
        sampleDuration,
        false,
        this.chunkOffset,
      );
    });
  };

  private onVideoDecode = async (frame: VideoFrame) => {
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

    this.videoEncoder.encode(processedFrame, { keyFrame });
    processedFrame.close();
  };

  private onVideoEncode = (
    chunk: EncodedVideoChunk,
    metadata?: EncodedVideoChunkMetadata,
  ) => {
    if (!this.videoCommonConfig) {
      throw new Error("INTERNAL ERROR: commonConfig must be defined");
    }

    this.encodingNums -= 1;
    this.encodedNums += 1;

    if (this.videoTrackId === null) {
      const description = metadata!.decoderConfig!.description;
      this.videoTrackId = addTrak(this.mp4File, {
        type: "video",
        width: this.videoCommonConfig.width,
        height: this.videoCommonConfig.height,
        avcDecoderConfigRecord: description,
      });
    }

    const uint8 = new Uint8Array(chunk.byteLength);
    chunk.copyTo(uint8);
    const sampleDuration = (chunk.duration! * VIDEO_TIMESCALE) / 1_000_000;

    this.chunkOffset = addSample(
      this.mp4File,
      this.videoTrackId,
      uint8,
      chunk.type === "key",
      sampleDuration,
      true,
      this.chunkOffset,
      this.isFirstVideoSample,
    );

    if (this.isFirstVideoSample) {
      this.isFirstVideoSample = false;
    }
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
