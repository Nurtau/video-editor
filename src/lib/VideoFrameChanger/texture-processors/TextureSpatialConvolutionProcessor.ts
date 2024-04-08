import { TextureAbstractProcessor } from "./TextureAbstractProcessor";
import { VideoBoxEffects } from "../../VideoBox";

type SpatialConvolutionEffects = Pick<VideoBoxEffects, "blur">;

const spatialConvolutionFragmentSource = `#version 300 es
precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_blur;

out vec4 outColor;

void main() {
  if (u_blur == 0.0) {
    outColor = texture(u_image, v_texCoord);
    return;
  }

  vec2 onePixel = vec2(1.0, 1.0) / u_resolution;
  vec4 sum = vec4(0.0);
  float totalWeight = 0.0;

  float step = u_blur > 5.0 ? round(u_blur / 5.0) : 1.0;

  for (float x = -u_blur; x <= u_blur; x+=step) {
    for (float y = -u_blur; y <= u_blur; y+=step) {
      vec2 offset = vec2(x, y) * onePixel;
      vec4 texture_color = texture(u_image, v_texCoord + offset);
      
      float weight = exp(-(x * x + y * y) / (u_blur * u_blur));
      
      sum += texture_color * weight;
      totalWeight += weight;
    }
  }

  vec4 blurredColor = sum / totalWeight;
  outColor = blurredColor;
}`;

export class TextureSpatialConvolutionProcessor extends TextureAbstractProcessor<SpatialConvolutionEffects> {
  private blurLocation: WebGLUniformLocation | null = null;

  constructor() {
    super();
    this.blurLocation = this.gl.getUniformLocation(this.program, "u_blur");
  }

  getFragmentShaderSource(): string {
    return spatialConvolutionFragmentSource;
  }

  changeTextureEffects(effects: SpatialConvolutionEffects): void {
    this.gl.uniform1f(this.blurLocation, effects.blur);
  }
}
