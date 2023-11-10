import { type VideoTrackBuffer } from "~/lib/VideoTrackBuffer";
import { VideoTrackBox } from "../molecules";

interface SliderWidgetProps {
  videoTrackBuffers: VideoTrackBuffer[];
}

export const SliderWidget = ({ videoTrackBuffers }: SliderWidgetProps) => {
  return (
    <>
      {videoTrackBuffers.map((buffer) => (
        <VideoTrackBox key={buffer.id} buffer={buffer} />
      ))}
    </>
  );
};
