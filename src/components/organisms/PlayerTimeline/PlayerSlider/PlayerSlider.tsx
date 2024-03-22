import { type VideoTrackBuffer } from "~/lib/VideoTrackBuffer";
import { SliderControlType } from "~/types";
import { VideoTrackBox } from "~/components/molecules";

import {
  trackBoxStyles,
  sliderBoxStyles,
  trackStyles,
} from "./PlayerSlider.css";

interface PlayerSliderProps {
  timeToPx: number;
  videoTrackBuffers: VideoTrackBuffer[];
  controlType: SliderControlType;
}

export const PlayerSlider = ({
  timeToPx,
  videoTrackBuffers,
  controlType,
}: PlayerSliderProps) => {
  return (
    <div className={sliderBoxStyles}>
      <div className={trackBoxStyles}></div>
      <div className={trackBoxStyles}></div>
      <div className={trackBoxStyles}>
        <div className={trackStyles}>
          {videoTrackBuffers.map((buffer) => (
            <VideoTrackBox
              key={buffer.id}
              buffer={buffer}
              timeToPx={timeToPx}
              controlType={controlType}
            />
          ))}
        </div>
      </div>
      <div className={trackBoxStyles}></div>
    </div>
  );
};
