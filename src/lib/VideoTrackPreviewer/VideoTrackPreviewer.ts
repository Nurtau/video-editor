import { VideoTrackDecoder } from "./VideoTrackDecoder";
import { type VideoTrackBuffer } from "../VideoTrackBuffer";

export class VideoTrackPreviewer {
  private trackDecoder: VideoTrackDecoder;
  private box: HTMLDivElement | null = null;
  private videoFrames: VideoFrame[] = [];

  constructor() {
    this.trackDecoder = new VideoTrackDecoder();
  }

  setBox = (box: HTMLDivElement) => {
    this.box = box;
  };

  setVideoTrackBuffer = async (videoTrackBuffer: VideoTrackBuffer) => {
    this.reset();

    const videoChunkGroups = videoTrackBuffer.getVideoChunksGroups();
    const videoKeyFrames = [];
    const codecConfig = videoTrackBuffer.getCodecConfig();
    for (const group of videoChunkGroups) {
      const key = group.videoChunks[0];
      videoKeyFrames.push(key);
    }
    for (const keyFrame of videoKeyFrames) {
      const videoFrames = await this.trackDecoder.decode(
        [keyFrame],
        codecConfig,
      );
      this.videoFrames.push(...videoFrames);
    }

    this.videoFrames.forEach(this.draw);
  };

  private draw = (frame: VideoFrame) => {
    if (!this.box) {
      throw new Error("box must be specified");
    }
    const canvas = document.createElement("canvas");
    this.box.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    canvas.width = frame.displayWidth;
    canvas.height = frame.displayHeight;
    canvas.style.width = "100px";
    canvas.style.height = "75px";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frame, 0, 0);
  };

  private reset = () => {
    if (this.box) {
      this.box.innerHTML = "";
    }

    this.videoFrames = [];
    this.trackDecoder.reset();
  };
}
