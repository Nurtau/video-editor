import type { Box, MP4aBox } from "mp4box";

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

const recreateAudioChunk = (
  chunk: EncodedAudioChunk,
  { timestamp }: { timestamp: number },
) => {
  const buffer = new Uint8Array(chunk.byteLength);
  chunk.copyTo(buffer);

  return new EncodedAudioChunk({
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

function isConsecutiveAudioFrame(
  previous: AudioData,
  next: AudioData,
): boolean {
  const diff = next.timestamp - (previous.timestamp + previous.duration);
  // Due to rounding, there can be a small gap between consecutive audio frames.
  return Math.abs(diff) <= VideoHelpers.getFrameTolerance(previous);
}

function isMp4aEntry(entry: Box): entry is MP4aBox {
  return entry.type === "mp4a";
}

export const VideoHelpers = {
  isChunkInTime,
  formatTime,
  recreateVideoChunk,
  recreateAudioChunk,
  clampTime,
  isFrameTimestampEqual,
  getFrameTolerance,
  arrayRemove,
  arrayRemoveAt,
  isConsecutiveAudioFrame,
  isMp4aEntry,
};
