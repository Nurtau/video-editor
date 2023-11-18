import { useMemo, useEffect, useState } from "react";

import { VideoHelpers } from "~/lib/VideoHelpers";
import { videoPlayerBus } from "~/lib/VideoPlayerBus";

import {
  ticksBoxStyles,
  tickStyles,
  tickBoxStyles,
  tickTimeTextStyles,
} from "./VideoTimelineTicks.css";

const TICK_STEPS = [1, 2, 3, 5, 10, 15, 30, 60, 120, 240, 300]; // in seconds
const OPTIMISTIC_STEP_DISTANCE = 100; // 100px between ticks

const findAppropriateStep = (timeToPx: number) => {
  let appropriateStep: number | null = null;
  let delta: number | null = null;

  TICK_STEPS.forEach((nextStep) => {
    const nextStepDistance = nextStep * timeToPx;
    const nextDelta = Math.abs(nextStepDistance - OPTIMISTIC_STEP_DISTANCE);

    if (!delta || nextDelta < delta) {
      delta = nextDelta;
      appropriateStep = nextStep;
    }
  });

  return appropriateStep!;
};

const range = (end: number) => {
  const array = Array(end + 1);

  for (let i = 0; i <= end; i++) {
    array[i] = i;
  }

  return array;
};

interface VideoTimelineTicksProps {
  timeToPx: number;
}

export const VideoTimelineTicks = ({ timeToPx }: VideoTimelineTicksProps) => {
  const [videoDuration, setDuration] = useState<number | null>(null);
  const step = useMemo(() => findAppropriateStep(timeToPx), [timeToPx]);

  useEffect(() => {
    return videoPlayerBus.subscribe("totalDuration", setDuration);
  }, []);

  if (!videoDuration) {
    return null;
  }

  const numOfTicks = Math.ceil(videoDuration / step);

  return (
    <div className={ticksBoxStyles}>
      {range(numOfTicks).map((index) => (
        <Tick key={index} time={index * step} timeToPx={timeToPx} />
      ))}
    </div>
  );
};

interface TickProps {
  time: number;
  timeToPx: number;
}

const Tick = ({ time, timeToPx }: TickProps) => {
  return (
    <div
      className={tickBoxStyles}
      style={{
        left: time * timeToPx,
      }}
    >
      <div className={tickStyles} />
      <div className={tickTimeTextStyles}>
        {VideoHelpers.formatTime(time, { includeMs: false })}
      </div>
    </div>
  );
};
