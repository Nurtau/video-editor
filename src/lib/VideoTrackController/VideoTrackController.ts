import { VideoTrackDecoder } from "./VideoTrackDecoder";
import { type VideoTrackBuffer } from "../VideoTrackBuffer";

const MAX_TRACK_FRAMES = 20;

interface VideoTrackControllerState {
  videoFrames: VideoFrame[] | null;
  duration: number;
}

interface VideoTrackControllerProps {
  onEmit(state: VideoTrackControllerState): void;
}

export class VideoTrackController {
  private onEmit: VideoTrackControllerProps["onEmit"];
  private trackDecoder: VideoTrackDecoder;

  static getDefaultState(): VideoTrackControllerState {
    return {
      videoFrames: null,
      duration: 0,
    };
  }

  constructor({ onEmit }: VideoTrackControllerProps) {
    this.onEmit = onEmit;
    this.trackDecoder = new VideoTrackDecoder();
  }

  setVideoTrackBuffer = async (videoTrackBuffer: VideoTrackBuffer) => {
    this.trackDecoder.reset();

    const range = videoTrackBuffer.getRange();

    // @NOW: add code so at least one closest key frame will be added to videoKeyFrames
    const videoChunkGroups = videoTrackBuffer.getVideoChunksGroups();
    const videoKeyFrames = videoChunkGroups
      .map((group) => group.videoChunks[0])
      .filter((chunk) => {
        const timestampInS = chunk.timestamp / 1e6;
        return range.start <= timestampInS && timestampInS <= range.end;
      });

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

    this.onEmit({
      videoFrames,
      duration: videoTrackBuffer.getDuration(),
    });
  };
}
