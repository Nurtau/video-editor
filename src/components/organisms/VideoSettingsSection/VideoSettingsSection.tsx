import { OverlayButton } from "~/components/atoms";
import { RATIOS, RATIO_RESOLUTIONS, type RatioKey } from "~/constants";
import { useVideoSettings } from "./useVideoSettings";

import {
  sectionBoxStyles,
  titleStyles,
  settingsBoxStyles,
  settingsTitleStyles,
  ratioCardList,
  resolutionCardList,
  ratioCardBoxStyles,
  ratioFigureBoxStyles,
  ratioFigureStyles,
  ratioCardTitleStyles,
  RATIO_FIGURE_BOX_WIDTH,
  RATIO_FIGURE_BOX_HEIGHT,
  resolutionCardBoxStyles,
  resolutionTitleStyles,
} from "./VideoSettingsSection.css";

export const VideoSettingsSection = () => {
  const { settings, setSettings } = useVideoSettings();

  const onRatioChange = (ratio: RatioKey) => {
    setSettings({
      ratio,
      resolution: RATIO_RESOLUTIONS[ratio].preffered,
    });
  };

  const onResolutionChange = (resolution: string) => {
    setSettings({ resolution });
  };

  return (
    <div className={sectionBoxStyles}>
      <h3 className={titleStyles}>Video settings</h3>
      <div className={settingsBoxStyles}>
        <div className={settingsTitleStyles}>Ratio</div>
        <div className={ratioCardList}>
          {RATIOS.map((ratio) => {
            const [width, height] = ratio.split(":").map(Number);
            return (
              <RatioCard
                width={width}
                height={height}
                onSelect={() => onRatioChange(ratio)}
                active={settings.ratio === ratio}
              />
            );
          })}
        </div>
      </div>
      <div className={settingsBoxStyles}>
        <div className={settingsTitleStyles}>Resolution</div>
        <div className={resolutionCardList}>
          {RATIO_RESOLUTIONS[settings.ratio].resolutions.map((resolution) => {
            return (
              <ResolutionCard
                label={resolution}
                onSelect={() => onResolutionChange(resolution)}
                active={settings.resolution === resolution}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface RatioCardProps {
  width: number;
  height: number;
  active: boolean;
  onSelect(): void;
}

const RatioCard = ({ width, height, active, onSelect }: RatioCardProps) => {
  let widthSize, heightSize;

  if (RATIO_FIGURE_BOX_WIDTH / width <= RATIO_FIGURE_BOX_HEIGHT / height) {
    widthSize = RATIO_FIGURE_BOX_WIDTH;
    heightSize = widthSize * (height / width);
  } else {
    heightSize = RATIO_FIGURE_BOX_HEIGHT;
    widthSize = heightSize * (width / height);
  }

  return (
    <div className={ratioCardBoxStyles({ active })}>
      <OverlayButton
        onClick={onSelect}
        bgHoverColor={active ? "white5" : "white10"}
      />
      <div className={ratioFigureBoxStyles}>
        <div
          className={ratioFigureStyles}
          style={{ width: widthSize, height: heightSize }}
        />
      </div>
      <div className={ratioCardTitleStyles}>
        {width}:{height}
      </div>
    </div>
  );
};

interface ResolutionCardProps {
  active: boolean;
  label: string;
  onSelect(): void;
}

const ResolutionCard = ({ active, label, onSelect }: ResolutionCardProps) => {
  return (
    <div className={resolutionCardBoxStyles({ active })}>
      <OverlayButton
        onClick={onSelect}
        bgHoverColor={active ? "white5" : "white10"}
      />
      <div className={resolutionTitleStyles}>{label}</div>
    </div>
  );
};
