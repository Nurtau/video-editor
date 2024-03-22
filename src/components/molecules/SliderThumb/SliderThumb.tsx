import { useRef, useEffect } from "react";

import { TIMELINE_PADDING } from "~/constants";
import { eventsBus } from "~/lib/EventsBus";

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

    const updateThumbPosition = (time: number) => {
      currentTimeRef.current = time;
      thumbBox.style.left = `${
        time * timeToPxRef.current + TIMELINE_PADDING.LEFT
      }px`;
    };

    updateThumbPosition(0);

    return eventsBus.subscribe("currentTime", updateThumbPosition);
  }, []);

  useEffect(() => {
    const thumbBox = thumbBoxRef.current;

    if (!thumbBox) {
      throw new Error("currentTimeNode must be specified");
    }

    thumbBox.style.left = `${
      currentTimeRef.current * timeToPx + TIMELINE_PADDING.LEFT
    }px`;
  }, [timeToPx]);

  return (
    <div ref={thumbBoxRef} className={thumbBoxStyles}>
      <div className={draggerStyles} />
      <div className={lineStyles} />
    </div>
  );
};
