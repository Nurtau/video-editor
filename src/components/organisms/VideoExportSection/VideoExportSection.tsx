import { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import { Button } from "~/components/atoms";
import { VideoExporter } from "~/lib/VideoExporter";
import { type VideoTrackBuffer } from "~/lib/VideoTrackBuffer";
import { useVideoSettings } from "../VideoSettingsSection";

import {
  sectionBoxStyles,
  titleStyles,
  contentBoxStyles,
  contentLabelStyles,
  resolutionStyles,
  ratioStyles,
  exportButtonBoxStyles,
  overlayBoxStyles,
  exportingCenterBoxStyles,
  exportingCenterTitleStyles,
  exportingButtonBoxStyles,
} from "./VideoExportSection.css";
import { tokens } from "~/ui-tokens";

interface VideoExportSectionProps {
  onExportStart(): void;
  videoTrackBuffers: VideoTrackBuffer[];
}

export const VideoExportSection = ({
  onExportStart,
  videoTrackBuffers,
}: VideoExportSectionProps) => {
  const { settings } = useVideoSettings();

  const [{ showProgress, curEncodedNums, maxEncodedNums, exported }, setState] =
    useState(VideoExporter.getDefaultState());
  const [exporterService] = useState(
    () =>
      new VideoExporter({
        onEmit: (newState) =>
          setState((prevState) => ({ ...prevState, ...newState })),
      }),
  );

  return (
    <>
      <div className={sectionBoxStyles}>
        <h3 className={titleStyles}>Video export</h3>
        <div className={contentBoxStyles}>
          <div className={contentLabelStyles}>
            Exported video will be in{" "}
            <span className={ratioStyles}>{settings.ratio}</span>,{" "}
            <span className={resolutionStyles}>{settings.resolution}</span>. If
            you want to change them, please go to video settings section.
          </div>
          <div className={exportButtonBoxStyles}>
            <Button
              maxWidth="18rem"
              variant="secondary"
              onClick={() => {
                onExportStart();
                const [width, height] = settings.resolution
                  .split("x")
                  .map(Number);
                exporterService.exportVideo(videoTrackBuffers, {
                  width,
                  height,
                });
              }}
              disabled={videoTrackBuffers.length === 0}
            >
              Export
            </Button>
          </div>
        </div>
      </div>
      {showProgress && (
        <div className={overlayBoxStyles}>
          <div />
          <div className={exportingCenterBoxStyles}>
            <div style={{ width: 240, height: 240 }}>
              <CircularProgressbar
                value={curEncodedNums}
                maxValue={maxEncodedNums}
                text={`${Math.round((curEncodedNums * 100) / maxEncodedNums)}%`}
                styles={buildStyles({
                  strokeLinecap: "round",
                  textSize: "21px",
                  pathTransitionDuration: 0.3,
                  pathColor: tokens.colors["bright-blue"],
                  trailColor: tokens.colors["secondary-bg"],
                  textColor: tokens.colors["pale-blue"],
                })}
              />
            </div>
            {exported ? (
              <div className={exportingCenterTitleStyles}>
                Video is ready to download
              </div>
            ) : (
              <div className={exportingCenterTitleStyles}>
                Exporting a video...
              </div>
            )}
          </div>
          <div className={exportingButtonBoxStyles}>
            {exported && (
              <Button
                maxWidth="15rem"
                variant="primary"
                onClick={exporterService.download}
              >
                Download
              </Button>
            )}
            <Button
              maxWidth="15rem"
              variant="secondary"
              onClick={() => {
                exporterService.reset();
                setState((state) => ({ ...state, showProgress: false }));
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
