import { type MouseEvent } from "react";

import { type VideoTrackBuffer } from "~/lib/VideoTrackBuffer";
import {
  VideoTrackBox,
  VideoTimelineTicks,
  SliderThumb,
} from "~/components/molecules";

import { sliderBoxStyles, tracksBoxStyles } from "./PlayerSlider.css";

// @NOW: should be removed eventually
interface PlayerSliderProps {
  timeToPx: number;
  videoTrackBuffers: VideoTrackBuffer[];
  seek(time: number): void;
}

export const PlayerSlider = ({
  timeToPx,
  videoTrackBuffers,
  seek,
}: PlayerSliderProps) => {
  const onSliderClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = event.clientX - rect.left;
    const time = position / timeToPx;
    seek(time);
  };

  return (
    <div className={sliderBoxStyles} onClick={onSliderClick}>
      <VideoTimelineTicks timeToPx={timeToPx} />
      <div className={tracksBoxStyles}>
        {videoTrackBuffers.map((buffer) => (
          <VideoTrackBox key={buffer.id} buffer={buffer} timeToPx={timeToPx} />
        ))}
      </div>
      <SliderThumb timeToPx={timeToPx} />
    </div>
  );
};
