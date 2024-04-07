import { type VideoBoxEffects } from "../VideoBox";
import {
  TexturePerPixelProcessor,
  TextureSpatialConvolutionProcessor,
} from "./texture-processors";

export class VideoFrameChanger {
  private perPixelProcessor: TexturePerPixelProcessor;
  private spatialConvolutionProcessor: TextureSpatialConvolutionProcessor;

  constructor() {
    this.perPixelProcessor = new TexturePerPixelProcessor();
    this.spatialConvolutionProcessor = new TextureSpatialConvolutionProcessor();
  }

  processFrame = (frame: VideoFrame, effects: VideoBoxEffects) => {
    const init = {
      codedHeight: frame.codedHeight,
      codedWidth: frame.codedWidth,
      displayWidth: frame.displayWidth,
      displayHeight: frame.codedHeight,
      duration: frame.duration ?? undefined,
      timestamp: frame.timestamp,
      format: frame.format!,
    };

    const processedByPixelCanvas = this.perPixelProcessor.processTexture(
      frame,
      effects,
    );
    const processedCanvas = this.spatialConvolutionProcessor.processTexture(
      processedByPixelCanvas,
      effects,
    );

    return new VideoFrame(processedCanvas, init);
  };
}
