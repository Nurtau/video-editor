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
    this.canvas.width = 0;
    this.canvas.height = 0;
    this.ctx = canvas.getContext("2d");

    this.updateDimensions();
    this.observeBoxWidth(this.updateDimensions);
  };

  draw = (frame: VideoFrame) => {
    if (!this.ctx || !this.canvas) {
      throw new Error("canvas must be specified");
    }

    this.canvas.width = frame.displayWidth;
    this.canvas.height = frame.displayHeight;
    this.updateCanvasDimensions();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(frame, 0, 0);
  };

  private observeBoxWidth = (cb: () => void) => {
    window.addEventListener("resize", cb);
    this.unwatch.push(() => window.removeEventListener("resize", cb));
  };

  private updateDimensions = () => {
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

    this.updateCanvasDimensions();
  };

  private updateCanvasDimensions = () => {
    if (!this.canvas) return;

    if (this.boxDimensions.width === 0 || this.boxDimensions.height === 0) {
      this.canvas.style.height = "0px";
      this.canvas.style.width = "0px";
      return;
    }

    const heightsRatio = this.canvas.height / this.boxDimensions.height;
    const widthsRatio = this.canvas.width / this.boxDimensions.width;

    let canvasWidth;
    let canvasHeight;

    if (heightsRatio > widthsRatio) {
      canvasWidth = this.canvas.width / heightsRatio;
      canvasHeight = this.canvas.height / heightsRatio;
    } else {
      canvasWidth = this.canvas.width / widthsRatio;
      canvasHeight = this.canvas.height / widthsRatio;
    }

    this.canvas.style.width = `${Math.floor(canvasWidth)}px`;
    this.canvas.style.height = `${Math.floor(canvasHeight)}px`;
  };

  private reset = () => {
    this.canvasOuterBox = null;
    this.canvas = null;
    this.ctx = null;
    this.unwatch.forEach((fn) => fn());
    this.unwatch = [];
  };
}
