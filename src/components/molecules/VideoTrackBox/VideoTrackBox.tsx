import { useState, useRef, useEffect } from "react";

import { type VideoTrackBuffer } from "~/lib/VideoTrackBuffer";
import { VideoTrackController } from "~/lib/VideoTrackController";

import { trackBoxStyles, frameBoxStyles } from "./VideoTrackBox.css";

const PREVIEW_WIDTH = 100;
const PREVIEW_DIMENSIONS = {
  WIDTH: PREVIEW_WIDTH,
  HEIGHT: Math.floor((PREVIEW_WIDTH * 9) / 16), // preserve ratio 16:9
};

const findPreviewFrames = (
  videoFrames: VideoFrame[],
  timeToPx: number,
  trackBoxWidth: number,
) => {
  const previewsNum = Math.ceil(trackBoxWidth / PREVIEW_DIMENSIONS.WIDTH);
  const previewFrames: VideoFrame[] = [];

  for (let i = 0; i < previewsNum; i++) {
    const previewPosition = (i + 0.5) * PREVIEW_DIMENSIONS.WIDTH;
    const middleTimeInMicros = Math.floor((1e6 * previewPosition) / timeToPx);

    let appropriateFrame: VideoFrame | null = null;
    let delta: number | null = null;

    videoFrames.forEach((frame) => {
      const nextDelta = Math.abs(frame.timestamp - middleTimeInMicros);

      if (!delta || nextDelta < delta) {
        delta = nextDelta;
        appropriateFrame = frame;
      }
    });

    if (appropriateFrame) {
      previewFrames.push(appropriateFrame);
    }
  }

  return previewFrames;
};

interface VideoTrackBoxProps {
  timeToPx: number;
  buffer: VideoTrackBuffer;
}

export const VideoTrackBox = ({ timeToPx, buffer }: VideoTrackBoxProps) => {
  const [{ videoFrames, duration }, setVideoTrackState] = useState(
    VideoTrackController.getDefaultState(),
  );
  const [trackPreviewer] = useState(
    () => new VideoTrackController({ onEmit: setVideoTrackState }),
  );

  useEffect(() => {
    trackPreviewer.setVideoTrackBuffer(buffer);
  }, [buffer]);

  if (!videoFrames) {
    return null;
  }

  const trackBoxWidth = duration * timeToPx;
  const previewFrames = findPreviewFrames(videoFrames, timeToPx, trackBoxWidth);

  return (
    <div className={trackBoxStyles} style={{ width: trackBoxWidth }}>
      {previewFrames.map((frame, index) => (
        <PrewiewBox frame={frame} key={index} />
      ))}
    </div>
  );
};

interface PreviewBoxProps {
  frame: VideoFrame;
}

const PrewiewBox = ({ frame }: PreviewBoxProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      throw new Error("canvas must be specified");
    }

    const ctx = canvas.getContext("2d")!;

    // @TODO: preserve ratio
    canvas.width = PREVIEW_DIMENSIONS.WIDTH * 4;
    canvas.height = PREVIEW_DIMENSIONS.HEIGHT * 4;
    canvas.style.width = `${PREVIEW_DIMENSIONS.WIDTH}px`;
    canvas.style.height = `${PREVIEW_DIMENSIONS.HEIGHT}px`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
  }, [frame]);

  return (
    <div
      className={frameBoxStyles}
      style={{
        width: PREVIEW_DIMENSIONS.WIDTH,
        height: PREVIEW_DIMENSIONS.HEIGHT,
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};
