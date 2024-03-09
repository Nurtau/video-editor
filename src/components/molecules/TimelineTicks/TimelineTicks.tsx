import { useMemo, useEffect, useState, Fragment } from "react";

import { videoPlayerBus } from "~/lib/VideoPlayerBus";
import { VideoHelpers } from "~/lib/VideoHelpers";
import {
  ticksBoxStyles,
  tickBoxStyles,
  labelStyles,
  circleStyles,
  circlesBoxStyles,
} from "./TimelineTicks.css";

const TICK_STEPS = [1, 2, 3, 5, 10, 15, 30, 60, 120, 240, 300]; // in seconds
const TICK_OPTIMISTIC_GAP = 100; // 100px between ticks
const LABEL_WIDTH = 30.7; // width with current styles
const CIRCLE_OPTIMISTIC_GAP = 15;

const findAppropriateStep = (timeToPx: number) => {
  let appropriateStep: number | null = null;
  let delta: number | null = null;

  TICK_STEPS.forEach((nextStep) => {
    const nextStepDistance = nextStep * timeToPx;
    const nextDelta = Math.abs(nextStepDistance - TICK_OPTIMISTIC_GAP);

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

interface TimelineTicksProps {
  timeToPx: number;
}

export const TimelineTicks = ({ timeToPx }: TimelineTicksProps) => {
  // @NOW: what about filling whole timeline with ticks without requesting a video or during short video
  const [videoDuration, setDuration] = useState<number | null>(null);
  const step = useMemo(() => findAppropriateStep(timeToPx), [timeToPx]);

  useEffect(() => {
    return videoPlayerBus.subscribe("totalDuration", setDuration);
  }, []);

  if (!videoDuration) {
    return null;
  }

  const numOfTicks = Math.round(videoDuration / step);
  const circlesBoxWidth = step * timeToPx - LABEL_WIDTH;
  const dots = Math.floor(circlesBoxWidth / CIRCLE_OPTIMISTIC_GAP);

  return (
    <div className={ticksBoxStyles}>
      {range(numOfTicks).map((index) => {
        const time = index * step;

        return (
          <Fragment key={index}>
            <Tick time={time} timeToPx={timeToPx} />
            {index !== numOfTicks && (
              <div
                className={circlesBoxStyles}
                style={{
                  left: time * timeToPx + LABEL_WIDTH / 2,
                  width: circlesBoxWidth,
                }}
              >
                {range(dots).map((dotIndex) => (
                  <div key={dotIndex} className={circleStyles} />
                ))}
              </div>
            )}
          </Fragment>
        );
      })}
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
      <div className={labelStyles}>
        {VideoHelpers.formatTime(time, { includeMs: false })}
      </div>
    </div>
  );
};
