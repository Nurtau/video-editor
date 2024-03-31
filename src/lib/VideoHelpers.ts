interface Chunk {
  timestamp: number;
  duration?: number | null;
}

const isChunkInTime = (chunk: Chunk, timeInMicros: number) => {
  return (
    chunk.timestamp <= timeInMicros &&
    timeInMicros <= chunk.timestamp + chunk.duration!
  );
};

const formatTime = (
  timeInSeconds: number,
  options: { includeMs?: boolean },
) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const remainingSeconds = timeInSeconds % 60;
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = options?.includeMs
    ? String(remainingSeconds.toFixed(2)).padStart(5, "0")
    : String(Math.ceil(remainingSeconds)).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
};

const recreateVideoChunk = (
  chunk: EncodedVideoChunk,
  { timestamp }: { timestamp: number },
) => {
  const buffer = new Uint8Array(chunk.byteLength);
  chunk.copyTo(buffer);

  return new EncodedVideoChunk({
    type: chunk.type,
    duration: chunk.duration ?? undefined,
    timestamp,
    data: buffer,
  });
};

const clampTime = (time: number, maxTime: number) => {
  if (time < 0) return 0;
  if (time > maxTime) return maxTime;
  return time;
};

function getFrameTolerance(
  frame: EncodedAudioChunk | AudioData | EncodedVideoChunk | VideoFrame,
) {
  return Math.ceil(frame.duration! / 16);
}

function isFrameTimestampEqual(
  left: EncodedAudioChunk | EncodedVideoChunk,
  right: AudioData | VideoFrame,
): boolean {
  return Math.abs(left.timestamp - right.timestamp) <= getFrameTolerance(left);
}

function arrayRemove<T>(array: T[], element: T): void {
  arrayRemoveAt(array, array.indexOf(element));
}

function arrayRemoveAt<T>(array: T[], index: number): void {
  if (index < 0) {
    return;
  } else if (index === 0) {
    array.shift();
  } else {
    array.splice(index, 1);
  }
}

function cloneAudioData(original: AudioData, timestamp: number): AudioData {
  const format = "f32-planar";
  let totalSize = 0;
  for (
    let channelIndex = 0;
    channelIndex < original.numberOfChannels;
    channelIndex++
  ) {
    totalSize +=
      original.allocationSize({ format, planeIndex: channelIndex }) /
      Float32Array.BYTES_PER_ELEMENT;
  }
  const buffer = new Float32Array(totalSize);
  let offset = 0;
  for (
    let channelIndex = 0;
    channelIndex < original.numberOfChannels;
    channelIndex++
  ) {
    const options: AudioDataCopyToOptions = {
      format,
      planeIndex: channelIndex,
    };
    const channelSize =
      original.allocationSize(options) / Float32Array.BYTES_PER_ELEMENT;
    original.copyTo(buffer.subarray(offset, offset + totalSize), options);
    offset += channelSize;
  }
  return new AudioData({
    data: buffer,
    format,
    numberOfChannels: original.numberOfChannels,
    numberOfFrames: original.numberOfFrames,
    sampleRate: original.sampleRate,
    timestamp: timestamp,
  });
}

export const VideoHelpers = {
  isChunkInTime,
  formatTime,
  recreateVideoChunk,
  clampTime,
  isFrameTimestampEqual,
  getFrameTolerance,
  arrayRemove,
  arrayRemoveAt,
  cloneAudioData,
};
