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

export const VideoHelpers = {
  isChunkInTime,
  formatTime,
};
