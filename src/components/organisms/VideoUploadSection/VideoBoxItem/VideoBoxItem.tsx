import { useEffect, useRef } from "react";

import { VideoFrameDecoder } from "~/lib/VideoFrameDecoder";
import { type VideoBox } from "~/lib/VideoBoxDemuxer";
import { OverlayButton } from "~/components/atoms/OverlayButton";

import {
  boxItemStyles,
  canvasBoxStyles,
  canvasStyles,
  boxNameStyles,
} from "./VideoBoxItem.css";

export type ExtendedVideoBox = {
  name: string;
} & VideoBox;

interface VideoBoxItemProps {
  box: ExtendedVideoBox;
  isChosen: boolean;
  onSelect(): void;
}

export const VideoBoxItem = ({
  box,
  isChosen,
  onSelect,
}: VideoBoxItemProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (box.videoTrackBuffers.length === 0) return;

    const decoder = new VideoFrameDecoder({
      onDecode: (frame) => {
        const canvas = canvasRef.current!;

        canvas.width = frame.displayWidth;
        canvas.height = frame.displayHeight;

        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(frame, 0, 0);
        frame.close();
      },
    });

    const videoTrackBuffer = box.videoTrackBuffers[0];
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
      <div className={boxNameStyles}>{box.name}</div>
      <OverlayButton
        onClick={onSelect}
        bgColor={isChosen ? "white10" : "transparent"}
        bgHoverColor="white15"
        borderRadius="2"
      />
    </div>
  );
};
