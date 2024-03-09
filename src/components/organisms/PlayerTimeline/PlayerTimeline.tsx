import { useState } from "react";

import { type VideoTrackBuffer } from "~/lib/VideoTrackBuffer";
import { TimelineTicks } from "~/components/molecules";

import { PlayerSlider } from "./PlayerSlider";
import {
  timelineBoxStyles,
  headerBoxStyles,
  sliderBoxStyles,
} from "./PlayerTimeline.css";

interface PlayerSliderProps {
  videoTrackBuffers: VideoTrackBuffer[];
}

export const PlayerTimeline = ({ videoTrackBuffers }: PlayerSliderProps) => {
  const [timeToPx, setTimeToPx] = useState(32);

  const zoom = () => {
    setTimeToPx((prev) => prev * 2);
  };

  const unzoom = () => {
    setTimeToPx((prev) => prev / 2);
  };

  return (
    <div className={timelineBoxStyles}>
      <div className={headerBoxStyles}>
        <TimelineTicks timeToPx={timeToPx} />
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
