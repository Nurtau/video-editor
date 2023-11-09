interface Chunk {
  timestamp: number;
  duration?: number | null;
}

const isChunkInTime = (chunk: Chunk, timeInMicros: number) => {
  return (
    chunk.timestamp <= timeInMicros &&
    timeInMicros < chunk.timestamp + chunk.duration!
  );
};

export const VideoHelpers = {
  isChunkInTime,
};
