const DEFAULT_RATIO = 16 / 9;

export class VideoRenderer {
  private canvasOuterBox: HTMLDivElement | null = null;
  private canvasInnerBox: HTMLDivElement | null = null;
  private boxDimensions = { width: 0, height: 0 };
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private unwatch: (() => void)[] = [];

  setCanvasBox = (canvasBox: HTMLDivElement | null) => {
    if (!canvasBox) {
      this.reset();
      return;
    }

    const innerBox = canvasBox.querySelector("div");
    const canvas = canvasBox.querySelector("canvas");

    if (!innerBox || !canvas) {
      throw new Error("innerBox and canvasBox must contain canvas element");
    }

    this.canvasOuterBox = canvasBox;
    this.canvasInnerBox = innerBox;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.updateBoxDimensions();
    this.observeBoxWidth(this.updateBoxDimensions);
  };

  draw = (frame: VideoFrame) => {
    if (!this.ctx || !this.canvas) {
      throw new Error("canvas must be specified");
    }

    this.updateCanvasDimensions(frame.displayWidth, frame.displayHeight);

    this.canvas.width = frame.displayWidth;
    this.canvas.height = frame.displayHeight;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(frame, 0, 0);
  };

  private updateCanvasDimensions = (
    frameWidth: number,
    frameHeight: number,
  ) => {
    if (!this.canvas) return;

    if (this.boxDimensions.width === 0 || this.boxDimensions.height === 0) {
      this.canvas.style.height = "0px";
      this.canvas.style.width = "0px";
      return;
    }

    const heightsRatio = frameWidth / this.boxDimensions.width;
    const widthsRatio = frameHeight / this.boxDimensions.height;

    let canvasWidth;
    let canvasHeight;

    if (heightsRatio > widthsRatio) {
      canvasWidth = frameWidth / heightsRatio;
      canvasHeight = frameHeight / heightsRatio;
    } else {
      canvasWidth = frameWidth / widthsRatio;
      canvasHeight = frameHeight / widthsRatio;
    }

    this.canvas.style.display = "block";
    this.canvas.style.width = `${Math.floor(canvasWidth)}px`;
    this.canvas.style.height = `${Math.floor(canvasHeight)}px`;
  };

  private observeBoxWidth = (cb: () => void) => {
    window.addEventListener("resize", cb);
    this.unwatch.push(() => window.removeEventListener("resize", cb));
  };

  private updateBoxDimensions = () => {
    if (!this.canvasOuterBox || !this.canvasInnerBox) return;

    const outerBoxRect = this.canvasOuterBox.getBoundingClientRect();
    const outerBoxRatio = outerBoxRect.width / outerBoxRect.height;

    let innerBoxWidth;
    let innerBoxHeight;

    if (outerBoxRatio > DEFAULT_RATIO) {
      // means that width is bigger than expected
      innerBoxHeight = outerBoxRect.height;
      innerBoxWidth = innerBoxHeight * DEFAULT_RATIO;
    } else {
      innerBoxWidth = outerBoxRect.width;
      innerBoxHeight = innerBoxWidth / DEFAULT_RATIO;
    }

    innerBoxWidth = Math.floor(innerBoxWidth);
    innerBoxHeight = Math.floor(innerBoxHeight);

    this.canvasInnerBox.style.width = `${innerBoxWidth}px`;
    this.canvasInnerBox.style.height = `${innerBoxHeight}px`;

    this.boxDimensions = {
      width: innerBoxWidth,
      height: innerBoxHeight,
    };
  };

  private reset = () => {
    this.canvasOuterBox = null;
    this.canvas = null;
    this.ctx = null;
    this.unwatch.forEach((fn) => fn());
    this.unwatch = [];
  };
}
