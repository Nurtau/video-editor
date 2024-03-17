import { type VideoTrackBuffer } from "~/lib/VideoTrackBuffer";

import { VideoTrackBox } from "~/components/molecules";

import {
  trackBoxStyles,
  sliderBoxStyles,
  trackStyles,
} from "./PlayerSlider.css";

interface PlayerSliderProps {
  timeToPx: number;
  videoTrackBuffers: VideoTrackBuffer[];
}

export const PlayerSlider = ({
  timeToPx,
  videoTrackBuffers,
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
            />
          ))}
        </div>
      </div>
      <div className={trackBoxStyles}></div>
    </div>
  );
};
