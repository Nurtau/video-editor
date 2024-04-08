import { VideoTrackDecoder } from "./VideoTrackDecoder";
import { type VideoBox } from "../VideoBox";

const MAX_TRACK_FRAMES = 20;

interface VideoKeyFrame {
  chunk: EncodedVideoChunk;
  codecConfig: VideoDecoderConfig;
}

interface VideoTrackControllerState {
  videoFrames: VideoFrame[] | null;
}

interface VideoTrackControllerProps {
  onEmit(state: VideoTrackControllerState): void;
}

export class VideoTrackController {
  private onEmit: VideoTrackControllerProps["onEmit"];
  private trackDecoder: VideoTrackDecoder;
  private videoFrames: VideoFrame[] = [];

  static getDefaultState(): VideoTrackControllerState {
    return {
      videoFrames: null,
    };
  }

  constructor({ onEmit }: VideoTrackControllerProps) {
    this.onEmit = onEmit;
    this.trackDecoder = new VideoTrackDecoder();
  }

  setVideoBox = async (videoBox: VideoBox) => {
    this.reset();

    const range = videoBox.getRange();

    const videoAllKeyFrames: VideoKeyFrame[] = [];

    videoBox.getVideoTrackBuffers().forEach((buffer) => {
      buffer.getVideoChunksGroups().forEach((group) => {
        videoAllKeyFrames.push({
          chunk: group.videoChunks[0],
          codecConfig: buffer.getCodecConfig(),
        });
      });
    });

    const videoKeyFrames = videoAllKeyFrames.filter(({ chunk }) => {
      const timestampInS = chunk.timestamp / 1e6;
      return range.start <= timestampInS && timestampInS <= range.end;
    });

    if (videoKeyFrames.length === 0) {
      let closestFrame: VideoKeyFrame | null = null;

      videoAllKeyFrames.forEach((keyFrame) => {
        if (!closestFrame) {
          closestFrame = keyFrame;
        } else {
          const midTrack = (range.start + range.end) / 2;
          if (
            Math.abs(keyFrame.chunk.timestamp / 1e6 - midTrack) <
            Math.abs(closestFrame.chunk.timestamp / 1e6 - midTrack)
          ) {
            closestFrame = keyFrame;
          }
        }
      });

      if (closestFrame) {
        videoKeyFrames.push(closestFrame);
      }
    }

    let shortenedKeyFrames;

    if (videoKeyFrames.length <= MAX_TRACK_FRAMES) {
      shortenedKeyFrames = videoKeyFrames;
    } else {
      let addedKeyFramesNum = 0;

      shortenedKeyFrames = videoKeyFrames.filter((_, index) => {
        const newIndex = Math.round(
          (index * MAX_TRACK_FRAMES) / videoKeyFrames.length,
        );

        if (newIndex >= addedKeyFramesNum) {
          addedKeyFramesNum++;
          return true;
        }

        return false;
      });
    }

    const videoFrames: VideoFrame[] = [];

    for (const { chunk, codecConfig } of shortenedKeyFrames) {
      const decodedFrames = await this.trackDecoder.decode(
        [chunk],
        codecConfig,
      );
      videoFrames.push(...decodedFrames);
    }

    this.videoFrames = videoFrames;

    this.onEmit({
      videoFrames,
    });
  };

  reset = () => {
    this.trackDecoder.reset();
    this.videoFrames.forEach((frame) => frame.close());
    this.videoFrames = [];
  };
}
