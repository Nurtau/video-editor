import { VideoTrackDecoder } from "./VideoTrackDecoder";
import { type VideoTrackBuffer } from "../VideoTrackBuffer";

const MAX_TRACK_FRAMES = 20;

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

  setVideoTrackBuffer = async (videoTrackBuffer: VideoTrackBuffer) => {
    this.reset();

    const range = videoTrackBuffer.getRange();

    const videoChunkGroups = videoTrackBuffer.getVideoChunksGroups();
    const videoAllKeyFrames = videoChunkGroups.map(
      (group) => group.videoChunks[0],
    );

    const videoKeyFrames = videoAllKeyFrames.filter((chunk) => {
      const timestampInS = chunk.timestamp / 1e6;
      return range.start <= timestampInS && timestampInS <= range.end;
    });

    if (videoKeyFrames.length === 0) {
      let closestFrame: EncodedVideoChunk | null = null;

      videoAllKeyFrames.forEach((keyFrame) => {
        if (!closestFrame) {
          closestFrame = keyFrame;
        } else {
          const midTrack = (range.start + range.end) / 2;
          if (
            Math.abs(keyFrame.timestamp / 1e6 - midTrack) <
            Math.abs(closestFrame.timestamp / 1e6 - midTrack)
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

    for (const frame of shortenedKeyFrames) {
      const decodedFrames = await this.trackDecoder.decode(
        [frame],
        videoTrackBuffer.getCodecConfig(),
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
