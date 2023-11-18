import { useRef, useEffect } from "react";

import { videoPlayerBus } from "~/lib/VideoPlayerBus";

import { thumbBoxStyles } from "./SliderThumb.css";

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
      thumbBox.style.left = `${time * timeToPxRef.current}px`;
      thumbBox.style.display = "block";
    });
  }, []);

  useEffect(() => {
    const thumbBox = thumbBoxRef.current;

    if (!thumbBox) {
      throw new Error("currentTimeNode must be specified");
    }

    thumbBox.style.left = `${currentTimeRef.current * timeToPx}px`;
  }, [timeToPx]);

  return <div ref={thumbBoxRef} className={thumbBoxStyles} />;
};
