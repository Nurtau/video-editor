export class VideoRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasConfigured = false;

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  draw = (frame: VideoFrame) => {
    if (!this.ctx || !this.canvas) {
      throw new Error("canvas must be specified");
    }
    if (!this.canvasConfigured) {
      this.canvas.width = frame.displayWidth;
      this.canvas.height = frame.displayHeight;
      this.canvasConfigured = true;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(frame, 0, 0);
  };
}
