import { type VideoTrackBuffer } from "~/lib/VideoTrackBuffer";
import { VideoTrackBox, VideoTimelineTicks } from "~/components/molecules";

import { sliderBoxStyles, tracksBoxStyles } from "./PlayerSlider.css";

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
      <VideoTimelineTicks timeToPx={timeToPx} />
      <div className={tracksBoxStyles}>
        {videoTrackBuffers.map((buffer) => (
          <VideoTrackBox key={buffer.id} buffer={buffer} />
        ))}
      </div>
    </div>
  );
};
