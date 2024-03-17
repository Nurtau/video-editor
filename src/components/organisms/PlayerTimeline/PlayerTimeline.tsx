import { useState } from "react";

import { type VideoTrackBuffer } from "~/lib/VideoTrackBuffer";
import { TimelineTicks } from "~/components/molecules";
import { IconButton } from "~/components/atoms";

import { PlayerSlider } from "./PlayerSlider";
import {
  timelineBoxStyles,
  headerBoxStyles,
  sliderBoxStyles,
  zoomingControlsBoxStyles,
} from "./PlayerTimeline.css";

const MIN_TIME_TO_PX = 1;
const MAX_TIME_TO_PX = 512;

interface PlayerSliderProps {
  videoTrackBuffers: VideoTrackBuffer[];
}

export const PlayerTimeline = ({ videoTrackBuffers }: PlayerSliderProps) => {
  const [timeToPx, setTimeToPx] = useState(32);

  const zoom = () => {
    setTimeToPx((prev) => Math.min(prev * 2, MAX_TIME_TO_PX));
  };

  const unzoom = () => {
    setTimeToPx((prev) => Math.max(prev / 2, MIN_TIME_TO_PX));
  };

  return (
    <div className={timelineBoxStyles}>
      <div className={headerBoxStyles}>
        <TimelineTicks timeToPx={timeToPx} />
        <div className={zoomingControlsBoxStyles}>
          <IconButton
            name="Plus"
            iconColor={timeToPx === MAX_TIME_TO_PX ? "white25" : "white80"}
            iconHoverColor={timeToPx === MAX_TIME_TO_PX ? "white25" : "white50"}
            iconSizing="md"
            p="1"
            onClick={zoom}
            disabled={timeToPx === MAX_TIME_TO_PX}
          />
          <IconButton
            name="Minus"
            iconColor={timeToPx === MIN_TIME_TO_PX ? "white25" : "white80"}
            iconHoverColor={timeToPx === MIN_TIME_TO_PX ? "white25" : "white50"}
            iconSizing="md"
            p="1"
            onClick={unzoom}
            disabled={timeToPx === MIN_TIME_TO_PX}
          />
        </div>
      </div>
      <div className={sliderBoxStyles}>
        <PlayerSlider
          videoTrackBuffers={videoTrackBuffers}
          timeToPx={timeToPx}
        />
      </div>
    </div>
  );
};
