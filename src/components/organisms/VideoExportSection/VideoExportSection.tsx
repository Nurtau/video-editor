import { useState } from "react";

import { Button } from "~/components/atoms";
import { VideoExporter } from "~/lib/VideoExporter";
import { type VideoTrackBuffer } from "~/lib/VideoTrackBuffer";
import { useVideoSettings } from "../VideoSettingsSection";

import { sectionBoxStyles, titleStyles } from "./VideoExportSection.css";

interface VideoExportSectionProps {
  videoTrackBuffers: VideoTrackBuffer[];
}

export const VideoExportSection = ({
  videoTrackBuffers,
}: VideoExportSectionProps) => {
  const { settings } = useVideoSettings();
  const [exporterService] = useState(() => new VideoExporter());

  return (
    <div className={sectionBoxStyles}>
      <h3 className={titleStyles}>Video export</h3>
      <Button
        variant="secondary"
        onClick={() => {
          const [width, height] = settings.resolution.split("x").map(Number);
          exporterService.exportVideo(videoTrackBuffers, { width, height });
        }}
        disabled={videoTrackBuffers.length === 0}
      >
        Export
      </Button>
    </div>
  );
};
