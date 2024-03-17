import { useRef, useEffect } from "react";

import { TIMELINE_PADDING_INLINE } from "~/constants";
import { videoPlayerBus } from "~/lib/VideoPlayerBus";

import { thumbBoxStyles, draggerStyles, lineStyles } from "./SliderThumb.css";

interface SliderThumbProps {
  timeToPx: number;
}

export const SliderThumb = ({ timeToPx }: SliderThumbProps) => {
  const thumbBoxRef = useRef<HTMLDivElement | null>(null);
  const currentTimeRef = useRef(0);
  const timeToPxRef = useRef(timeToPx);
  timeToPxRef.current = timeToPx;

  useEffect(() => {
    const thumbBox = thumbBoxRef.current;

    if (!thumbBox) {
      throw new Error("currentTimeNode must be specified");
    }

    return videoPlayerBus.subscribe("currentTime", (time) => {
      currentTimeRef.current = time;
      thumbBox.style.left = `${
        time * timeToPxRef.current + TIMELINE_PADDING_INLINE
      }px`;
      thumbBox.style.display = "flex";
    });
  }, []);

  useEffect(() => {
    const thumbBox = thumbBoxRef.current;

    if (!thumbBox) {
      throw new Error("currentTimeNode must be specified");
    }

    thumbBox.style.left = `${currentTimeRef.current * timeToPx}px`;
  }, [timeToPx]);

  return (
    <div ref={thumbBoxRef} className={thumbBoxStyles}>
      <div className={draggerStyles} />
      <div className={lineStyles} />
    </div>
  );
};
