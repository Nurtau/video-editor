import { useState } from "react";

import { Button } from "~/components/atoms";
import { VideoExporter } from "~/lib/VideoExporter";
import { type VideoTrackBuffer } from "~/lib/VideoTrackBuffer";

import { sectionBoxStyles, titleStyles } from "./VideoExportSection.css";

interface VideoExportSectionProps {
  videoTrackBuffers: VideoTrackBuffer[];
}

export const VideoExportSection = ({
  videoTrackBuffers,
}: VideoExportSectionProps) => {
  const [exporterService] = useState(() => new VideoExporter());

  return (
    <div className={sectionBoxStyles}>
      <h3 className={titleStyles}>Video export</h3>
      <Button
        variant="secondary"
        onClick={() => {
          exporterService.exportVideo(videoTrackBuffers);
        }}
        disabled={videoTrackBuffers.length === 0}
      >
        Export
      </Button>
    </div>
  );
};
