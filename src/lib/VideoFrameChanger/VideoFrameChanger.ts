import { WebglHelpers } from "./WebglHelpers";

const vertexShaderSource = `#version 300 es
in vec2 a_position;
in vec2 a_texCoord;
uniform vec2 u_resolution;

out vec2 v_texCoord;

void main() {
  vec2 zeroToOne = a_position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  v_texCoord = a_texCoord;  
}`;

const fragmentShaderSource = `#version 300 es
precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_blur;

out vec4 outColor;

void main() {
  vec2 onePixel = vec2(1.0, 1.0) / u_resolution;
  vec4 sum = vec4(0.0);
  float totalWeight = 0.0;

  float step = u_blur > 10.0 ? round(u_blur / 10.0) : 1.0;


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

export class VideoFrameChanger {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private positionBuffer: any;
  private resolutionLocation: WebGLUniformLocation | null = null;
  private imageLocation: WebGLUniformLocation | null = null;
  private blurLocation: WebGLUniformLocation | null = null;

  constructor() {
    this.canvas = document.createElement("canvas");
    const gl = this.canvas.getContext("webgl2");

    if (!gl) {
      throw new Error("TEMPORARY WORKAROUND");
    }

    this.gl = gl;

    const vertexShader = WebglHelpers.createShader(
      gl,
      gl.VERTEX_SHADER,
      vertexShaderSource,
    );
    const fragmentShader = WebglHelpers.createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );

    const program = WebglHelpers.createProgram(
      gl,
      vertexShader,
      fragmentShader,
    );

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position",
    );
    const texCoordAttributeLocation = gl.getAttribLocation(
      program,
      "a_texCoord",
    );
    this.resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    this.imageLocation = gl.getUniformLocation(program, "u_image");
    this.blurLocation = gl.getUniformLocation(program, "u_blur");

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    this.positionBuffer = gl.createBuffer();
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    let size = 2;
    let type = gl.FLOAT;
    let normalize = false;
    let stride = 0;
    let offset = 0;
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset,
    );

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
      ]),
      gl.STATIC_DRAW,
    );

    gl.enableVertexAttribArray(texCoordAttributeLocation);

    size = 2;
    type = gl.FLOAT;
    normalize = false;
    stride = 0;
    offset = 0;
    gl.vertexAttribPointer(
      texCoordAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset,
    );

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    this.gl.useProgram(program);

    this.changeFrameFilters();
  }

  // @TODO: rework changing filters
  changeFrameFilters = () => {
    this.gl.uniform1f(this.blurLocation, 50.0);
  };

  processFrame = (frame: VideoFrame) => {
    this.changeFrameFilters();
    const mipLevel = 0;
    const internalFormat = this.gl.RGBA;
    const srcFormat = this.gl.RGBA;
    const srcType = this.gl.UNSIGNED_BYTE;
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      mipLevel,
      internalFormat,
      srcFormat,
      srcType,
      frame,
    );

    this.gl.canvas.width = frame.codedWidth;
    this.gl.canvas.height = frame.codedHeight;
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.uniform2f(
      this.resolutionLocation,
      this.gl.canvas.width,
      this.gl.canvas.height,
    );
    this.gl.uniform1i(this.imageLocation, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

    WebglHelpers.setRectangle(
      this.gl,
      0,
      0,
      frame.codedWidth,
      frame.codedHeight,
    );

    const primitiveType = this.gl.TRIANGLES;
    const offset = 0;
    const count = 6;
    this.gl.drawArrays(primitiveType, offset, count);

    this.gl.flush();
    this.gl.finish();

    const init = {
      codedHeight: frame.codedHeight,
      codedWidth: frame.codedWidth,
      displayWidth: frame.displayWidth,
      displayHeight: frame.codedHeight,
      duration: frame.duration ?? undefined,
      timestamp: frame.timestamp,
      format: frame.format!,
    };

    const newFrame = new VideoFrame(this.gl.canvas, init);

    frame.close();
    return newFrame;
  };
}
