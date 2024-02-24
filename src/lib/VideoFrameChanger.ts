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

uniform sampler2D u_image;
uniform float u_threshold;
in vec2 v_texCoord;

out vec4 outColor;

void main() {
  vec4 texture_color = texture(u_image, v_texCoord);

  if (u_threshold < 1.0) {
    float grayscale = (texture_color.r + texture_color.g + texture_color.b) / 3.0;
    float value = grayscale > 0.5 ? 1.0 : 0.0;
    outColor = vec4(value, value, value, texture_color.a);
  } else {
    outColor = texture_color;
  }

}`;

const createShader = (
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) => {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error("TEMPORARY WORKAROUND");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    throw new Error("TEMPORARY WORKAROUND");
  }

  return shader;
};

const createProgram = (
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) => {
  const program = gl.createProgram();

  if (!program) {
    throw new Error("TEMPORARY WORKAROUND");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (!success) {
    throw new Error("TEMPORARY WORKAROUND");
  }

  return program;
};

const setRectangle = (
  gl: WebGL2RenderingContext,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW,
  );
};

export class VideoFrameChanger {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private positionBuffer: any;
  private resolutionLocation: WebGLUniformLocation | null = null;
  private imageLocation: WebGLUniformLocation | null = null;
  private thresholdLocation: WebGLUniformLocation | null = null;
  private threshold: false | number = false;

  constructor() {
    this.canvas = document.createElement("canvas");
    const gl = this.canvas.getContext("webgl2");

    if (!gl) {
      throw new Error("TEMPORARY WORKAROUND");
    }

    this.gl = gl;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );

    const program = createProgram(gl, vertexShader, fragmentShader);

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
    this.thresholdLocation = gl.getUniformLocation(program, "u_threshold");

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

    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    this.gl.useProgram(program);

    this.changeFrameFilters();
  }

  // @TODO: rework changing filters 
  changeFrameFilters = () => {
    this.threshold = this.threshold ? false : 0.5;

    this.gl.uniform1f(
      this.thresholdLocation,
      this.threshold ? this.threshold : 1.5,
    );
  };

  processFrame = (frame: VideoFrame) => {
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

    setRectangle(this.gl, 0, 0, frame.codedWidth, frame.codedHeight);

    const primitiveType = this.gl.TRIANGLES;
    const offset = 0;
    let count = 6;
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
