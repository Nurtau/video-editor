import { TextureAbstractProcessor } from "./TextureAbstractProcessor";
import { VideoEffects } from "../../VideoTrackBuffer";

type PerPixelEffects = Pick<VideoEffects, "opacity">;

const perPixelFragmentSource = `#version 300 es
precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_opacity;

out vec4 outColor;

void main() {
  vec4 color = texture(u_image, v_texCoord);
  color.rgb *= u_opacity;
  outColor = color;
}`;

export class TexturePerPixelProcessor extends TextureAbstractProcessor<PerPixelEffects> {
  private opacityLocation: WebGLUniformLocation | null = null;

  constructor() {
    super();
    this.opacityLocation = this.gl.getUniformLocation(
      this.program,
      "u_opacity",
    );
  }

  getFragmentShaderSource(): string {
    return perPixelFragmentSource;
  }

  changeTextureEffects(effects: PerPixelEffects): void {
    this.gl.uniform1f(this.opacityLocation, effects.opacity / 100);
  }
}
