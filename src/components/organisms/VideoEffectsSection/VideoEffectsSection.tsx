import { useState, useEffect } from "react";

import { Slider } from "~/components/atoms";

import { sectionBoxStyles, titleStyles } from "./VideoEffectsSection.css";
import { useActiveTrack } from "~/components/molecules";
import {
  type VideoTrackBuffer,
  type VideoEffects,
} from "~/lib/VideoTrackBuffer";

export const VideoEffectsSection = () => {
  const { activeTrack } = useActiveTrack();

  return (
    <div className={sectionBoxStyles}>
      <h3 className={titleStyles}>Video effects</h3>
      {activeTrack && <ActiveTrackManipulation track={activeTrack} />}
    </div>
  );
};

interface ActiveTrackManipulationProps {
  track: VideoTrackBuffer;
}

const ActiveTrackManipulation = ({ track }: ActiveTrackManipulationProps) => {
  const [effects, setEffects] = useState(track.getEffects());

  useEffect(() => {
    setEffects(track.getEffects());
  }, [track.id]);

  const updateEffects = (effects: Partial<VideoEffects>) => {
    track.updateEffects(effects);
    setEffects(track.getEffects());
  };

  return (
    <>
      <Slider
        title="Blur"
        min={0}
        max={100}
        value={effects.blur}
        onChange={(blur) => {
          updateEffects({ blur });
        }}
      />
    </>
  );
};
