import { useLayoutEffect, useRef } from "react";

import { VideoFrameDecoder } from "~/lib/VideoFrameDecoder";
import { type VideoBox } from "~/lib/VideoBox";
import { OverlayButton } from "~/components/atoms";

import {
  boxItemStyles,
  canvasBoxStyles,
  canvasStyles,
  boxNameStyles,
} from "./VideoBoxItem.css";

export type VideoUploadBox = {
  name: string;
  frame?: VideoFrame;
  innerBox: VideoBox;
};

interface VideoBoxItemProps {
  item: VideoUploadBox;
  isChosen: boolean;
  onSelect(): void;
  onFrame(videoFrame: VideoFrame): void;
}

export const VideoBoxItem = ({
  item,
  isChosen,
  onSelect,
  onFrame,
}: VideoBoxItemProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    const drawFrame = (frame: VideoFrame) => {
      const canvas = canvasRef.current!;

      canvas.width = Math.floor(frame.displayWidth / 5);
      canvas.height = Math.floor(frame.displayHeight / 5);

      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
    };

    if (item.frame) {
      drawFrame(item.frame);
      return;
    }

    const videoTrackBuffers = item.innerBox.getVideoTrackBuffers();

    if (videoTrackBuffers.length === 0) return;

    const decoder = new VideoFrameDecoder({
      onDecode: (frame) => {
        drawFrame(frame);
        onFrame(frame);
      },
    });

    const videoTrackBuffer = videoTrackBuffers[0];
    const chunk = videoTrackBuffer.getVideoChunksGroups()[0].videoChunks[0];

    decoder.decode(chunk, videoTrackBuffer.getCodecConfig());
    decoder.flush();

    return () => {
      decoder.reset();
    };
  }, []);

  return (
    <div className={boxItemStyles}>
      <div className={canvasBoxStyles}>
        <canvas ref={canvasRef} className={canvasStyles} />
      </div>
      <div className={boxNameStyles}>{item.name}</div>
      <OverlayButton
        onClick={onSelect}
        bgColor={isChosen ? "white10" : "transparent"}
        bgHoverColor="white15"
        borderRadius="2"
      />
    </div>
  );
};
