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

export abstract class TextureAbstractProcessor<
  TEffects extends Record<string, unknown>,
> {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  private canvas: HTMLCanvasElement;
  private positionBuffer: any;
  private resolutionLocation: WebGLUniformLocation | null = null;
  private imageLocation: WebGLUniformLocation | null = null;

  abstract getFragmentShaderSource(): string;

  constructor() {
    this.canvas = document.createElement("canvas");
    const gl = this.canvas.getContext("webgl2");

    if (!gl) {
      throw new Error("webgl2 context cannot be initiated");
    }

    this.gl = gl;

    const vertexShader = WebglHelpers.createShader(
      gl,
      gl.VERTEX_SHADER,
      this.getVertexShaderSource(),
    );
    const fragmentShader = WebglHelpers.createShader(
      gl,
      gl.FRAGMENT_SHADER,
      this.getFragmentShaderSource(),
    );

    this.program = WebglHelpers.createProgram(gl, vertexShader, fragmentShader);

    const positionAttributeLocation = gl.getAttribLocation(
      this.program,
      "a_position",
    );
    const texCoordAttributeLocation = gl.getAttribLocation(
      this.program,
      "a_texCoord",
    );

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

    this.gl.useProgram(this.program);

    this.resolutionLocation = gl.getUniformLocation(
      this.program,
      "u_resolution",
    );
    this.imageLocation = gl.getUniformLocation(this.program, "u_image");
  }

  private getVertexShaderSource() {
    return vertexShaderSource;
  }

  abstract changeTextureEffects(effects: TEffects): void;

  processTexture = (
    texture: VideoFrame | HTMLCanvasElement | OffscreenCanvas,
    effects: TEffects,
  ) => {
    this.changeTextureEffects(effects);

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
      texture,
    );

    this.gl.canvas.width =
      texture instanceof EventTarget ? texture.width : texture.codedWidth;
    this.gl.canvas.height =
      texture instanceof EventTarget ? texture.height : texture.codedHeight;
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
      this.gl.canvas.width,
      this.gl.canvas.height,
    );

    const primitiveType = this.gl.TRIANGLES;
    const offset = 0;
    const count = 6;
    this.gl.drawArrays(primitiveType, offset, count);

    this.gl.flush();
    this.gl.finish();

    return this.gl.canvas;
  };
}
