import { useState, useEffect } from "react";

import { type VideoTrackBuffer } from "~/lib/VideoTrackBuffer";
import { VideoTrackPreviewer } from "~/lib/VideoTrackPreviewer";

import { trackBoxStyles } from "./VideoTrackBox.css";

interface VideoTrackBoxProps {
  buffer: VideoTrackBuffer;
}

export const VideoTrackBox = ({ buffer }: VideoTrackBoxProps) => {
  const [trackPreviewer] = useState(() => new VideoTrackPreviewer());

  useEffect(() => {
    trackPreviewer.setVideoTrackBuffer(buffer);
  }, [buffer]);

  return <div ref={trackPreviewer.setBox} className={trackBoxStyles} />;
};
