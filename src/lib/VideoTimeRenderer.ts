import { VideoHelpers } from "./VideoHelpers";

export class VideoTimeRenderer {
  private currentTimeBox: HTMLDivElement | null = null;
  private durationBox: HTMLDivElement | null = null;
  setTimeBox = (timeBox: HTMLDivElement | null) => {
    if (!timeBox) {
      return;
    }
    this.currentTimeBox = timeBox.firstElementChild as HTMLDivElement;
    this.durationBox = timeBox.lastElementChild as HTMLDivElement;
  };

  renderCurrentTime = (currentTime: number) => {
    if (!this.currentTimeBox) {
      return;
    }
    this.currentTimeBox.innerText = VideoHelpers.formatTime(currentTime, {
      includeMs: true,
    });
  };

  renderDuration = (duration: number) => {
    if (!this.durationBox) {
      return;
    }
    this.durationBox.innerText = VideoHelpers.formatTime(duration, {
      includeMs: true,
    });
  };
}
