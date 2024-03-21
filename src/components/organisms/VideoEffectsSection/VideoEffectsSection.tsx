import { useState, useMemo, useEffect } from "react";

import { Slider } from "~/components/atoms";
import { eventsBus } from "~/lib/EventsBus";
import { throttle } from "~/lib/helpers";

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

  const throttledBusDispatch = useMemo(
    () =>
      throttle(() => {
        eventsBus.dispatch("modifiedVideoTrackId", track.id);
      }, 100),
    [track.id],
  );

  useEffect(() => {
    setEffects(track.getEffects());
  }, [track.id]);

  const updateEffects = (effects: Partial<VideoEffects>) => {
    track.updateEffects(effects);
    setEffects(track.getEffects());
    throttledBusDispatch();
  };

  return (
    <>
      <Slider
        title="Opacity"
        min={0}
        max={100}
        getValueText={(value) => `${value}%`}
        value={effects.opacity}
        onChange={(opacity) => {
          updateEffects({ opacity });
        }}
      />
      <Slider
        title="Hue Shift"
        min={-180}
        max={180}
        getValueText={(value) => `${value} degrees`}
        value={effects.hue}
        onChange={(hue) => {
          updateEffects({ hue });
        }}
      />
      <Slider
        title="Saturation"
        min={-100}
        max={100}
        value={effects.saturation}
        onChange={(saturation) => {
          updateEffects({ saturation });
        }}
      />
      <Slider
        title="Brigthness"
        min={-100}
        max={100}
        value={effects.brigthness}
        onChange={(brigthness) => {
          updateEffects({ brigthness });
        }}
      />
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
