import { TextureAbstractProcessor } from "./TextureAbstractProcessor";
import { VideoEffects } from "../../VideoTrackBuffer";

type PerPixelEffects = Pick<
  VideoEffects,
  "opacity" | "brigthness" | "saturation" | "hue"
>;

const perPixelFragmentSource = `#version 300 es
precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_image;
uniform vec2 u_resolution;

uniform float u_opacity;
uniform float u_brightness;
uniform float u_saturation;
uniform float u_hue;

out vec4 outColor;

vec3 rgb_to_hsb(vec3 rgb) {
    float minVal = min(min(rgb.r, rgb.g), rgb.b);
    float maxVal = max(max(rgb.r, rgb.g), rgb.b);
    float delta = maxVal - minVal;
    float hue = 0.0;
    float saturation = (maxVal == 0.0) ? 0.0 : (delta / maxVal);
    float brightness = maxVal;

    if (delta > 0.0) {
        if (maxVal == rgb.r) {
            hue = (rgb.g - rgb.b) / delta;
        } else if (maxVal == rgb.g) {
            hue = 2.0 + (rgb.b - rgb.r) / delta;
        } else {
            hue = 4.0 + (rgb.r - rgb.g) / delta;
        }
        hue /= 6.0;
        if (hue < 0.0) {
            hue += 1.0;
        }
    }

    return vec3(hue, saturation, brightness);
}

vec3 hsb_to_rgb(vec3 hsb) {
    float hue = hsb.x;
    float saturation = hsb.y;
    float brightness = hsb.z;

    float r = brightness;
    float g = brightness;
    float b = brightness;

    if (saturation != 0.0) {
        float hue6 = (hue == 1.0) ? 0.0 : (hue * 6.0);
        int hue_i = int(hue6);
        float f = hue6 - float(hue_i);
        float p = brightness * (1.0 - saturation);
        float q = brightness * (1.0 - saturation * f);
        float t = brightness * (1.0 - saturation * (1.0 - f));
        if (hue_i == 0) {
            r = brightness;
            g = t;
            b = p;
        } else if (hue_i == 1) {
            r = q;
            g = brightness;
            b = p;
        } else if (hue_i == 2) {
            r = p;
            g = brightness;
            b = t;
        } else if (hue_i == 3) {
            r = p;
            g = q;
            b = brightness;
        } else if (hue_i == 4) {
            r = t;
            g = p;
            b = brightness;
        } else {
            r = brightness;
            g = p;
            b = q;
        }
    }

    return vec3(r, g, b);
}

float clamp_color(float value) {
  return min(max(value, 0.0), 1.0);
}

void main() {
  vec4 color = texture(u_image, v_texCoord);
  vec3 hsb = rgb_to_hsb(color.rgb);
  
  float updated_brightness = clamp_color(hsb[2] + u_brightness);
  hsb[2] = updated_brightness;

  float updated_saturation = clamp_color(hsb[1] + u_saturation);
  hsb[1] = updated_saturation;

  float updated_hue = hsb[0] + u_hue;

  if (updated_hue < 0.0) {
    updated_hue += 1.0;
  } else if (updated_hue > 1.0) {
    updated_hue -= 1.0;
  }
  
  hsb[0] = updated_hue;

  color.rgb = hsb_to_rgb(hsb);
  color.rgb *= u_opacity;
  outColor = color;
}`;

export class TexturePerPixelProcessor extends TextureAbstractProcessor<PerPixelEffects> {
  private opacityLocation: WebGLUniformLocation | null = null;
  private brigthnessLocation: WebGLUniformLocation | null = null;
  private saturationLocation: WebGLUniformLocation | null = null;
  private hueLocation: WebGLUniformLocation | null = null;

  constructor() {
    super();
    this.opacityLocation = this.gl.getUniformLocation(
      this.program,
      "u_opacity",
    );
    this.brigthnessLocation = this.gl.getUniformLocation(
      this.program,
      "u_brightness",
    );
    this.saturationLocation = this.gl.getUniformLocation(
      this.program,
      "u_saturation",
    );
    this.hueLocation = this.gl.getUniformLocation(this.program, "u_hue");
  }

  getFragmentShaderSource(): string {
    return perPixelFragmentSource;
  }

  changeTextureEffects(effects: PerPixelEffects): void {
    this.gl.uniform1f(this.opacityLocation, effects.opacity / 100);
    this.gl.uniform1f(this.brigthnessLocation, effects.brigthness / 500);
    this.gl.uniform1f(this.saturationLocation, effects.saturation / 500);
    this.gl.uniform1f(this.hueLocation, effects.hue / 360);
  }
}
