import { DEFAULT_RATIO, RATIO_RESOLUTIONS, type RatioKey } from "~/constants";

export interface VideoRendererRawSize {
  ratio: RatioKey;
  resolution: string;
}

interface VideoRendererSize {
  ratio: number;
  resolution: {
    width: number;
    height: number;
  };
}

export class VideoRenderer {
  private canvasOuterBox: HTMLDivElement | null = null;
  private canvasInnerBox: HTMLDivElement | null = null;
  private boxDimensions = { width: 0, height: 0 };
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private unwatch: (() => void)[] = [];

  private size: VideoRendererSize;

  constructor() {
    this.size = this.extractSize({
      ratio: DEFAULT_RATIO,
      resolution: RATIO_RESOLUTIONS[DEFAULT_RATIO].preffered,
    });
  }

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

  setSize = (size: VideoRendererRawSize) => {
    this.size = this.extractSize(size);
    this.updateDimensions();
  };

  draw = (frame: VideoFrame) => {
    if (!this.ctx || !this.canvas) {
      throw new Error("canvas must be specified");
    }

    this.canvas.width = this.size.resolution.width;
    this.canvas.height = this.size.resolution.height;
    this.updateCanvasDimensions();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      frame,
      0,
      0,
      frame.displayWidth,
      frame.displayHeight,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );
  };

  clear = () => {
    if (!this.ctx || !this.canvas) {
      throw new Error("canvas must be specified");
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  private extractSize = (size: VideoRendererRawSize): VideoRendererSize => {
    const [ratioWidth, ratioHeight] = size.ratio.split(":").map(Number);
    const [resolutionWidth, resolutionHeight] = size.resolution
      .split("x")
      .map(Number);

    return {
      ratio: ratioWidth / ratioHeight,
      resolution: {
        width: resolutionWidth,
        height: resolutionHeight,
      },
    };
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

    if (outerBoxRatio > this.size.ratio) {
      // means that width is bigger than expected
      innerBoxHeight = outerBoxRect.height;
      innerBoxWidth = innerBoxHeight * this.size.ratio;
    } else {
      innerBoxWidth = outerBoxRect.width;
      innerBoxHeight = innerBoxWidth / this.size.ratio;
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
