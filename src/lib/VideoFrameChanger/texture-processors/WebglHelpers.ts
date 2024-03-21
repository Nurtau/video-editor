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
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW,
  );
};

export const WebglHelpers = {
  createShader,
  createProgram,
  setRectangle,
};
