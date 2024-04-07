import { useState, useMemo, useEffect } from "react";

import { Slider, Button } from "~/components/atoms";
import { eventsBus } from "~/lib/EventsBus";
import { throttle } from "~/lib/helpers";

import { useActiveVideoBox } from "~/components/molecules";
import { type VideoBox, type VideoBoxEffects } from "~/lib/VideoBox";

import {
  sectionBoxStyles,
  titleStyles,
  slidersBoxStyles,
  activeTrackBoxStyles,
  resetButtonBoxStyles,
  contentLabelStyles,
  boxBorderStyles,
} from "./VideoEffectsSection.css";

export const VideoEffectsSection = () => {
  const { activeVideoBox } = useActiveVideoBox();

  return (
    <div className={sectionBoxStyles}>
      <h3 className={titleStyles}>Video effects</h3>
      {!activeVideoBox && (
        <div className={boxBorderStyles}>
          <div className={contentLabelStyles}>
            To apply the video effects, please select the video track first
          </div>
        </div>
      )}
      {activeVideoBox && <ActiveTrackManipulation videoBox={activeVideoBox} />}
    </div>
  );
};

interface ActiveTrackManipulationProps {
  videoBox: VideoBox;
}

const ActiveTrackManipulation = ({
  videoBox,
}: ActiveTrackManipulationProps) => {
  const [effects, setEffects] = useState(videoBox.getEffects());

  const throttledBusDispatch = useMemo(
    () =>
      throttle(() => {
        eventsBus.dispatch("modifiedVideoBoxId", videoBox.id);
      }, 100),
    [videoBox.id],
  );

  useEffect(() => {
    setEffects(videoBox.getEffects());
  }, [videoBox.id]);

  const updateEffects = (effects: Partial<VideoBoxEffects>) => {
    videoBox.updateEffects(effects);
    setEffects(videoBox.getEffects());
    throttledBusDispatch();
  };

  const resetEffects = () => {
    videoBox.resetEffects();
    setEffects(videoBox.getEffects());
    throttledBusDispatch();
  };

  return (
    <div className={activeTrackBoxStyles}>
      <div className={slidersBoxStyles}>
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
      </div>
      <div className={resetButtonBoxStyles}>
        <Button variant="secondary" maxWidth="18rem" onClick={resetEffects}>
          Reset
        </Button>
      </div>
    </div>
  );
};
