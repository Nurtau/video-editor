import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { VideoController } from "./lib/VideoController";
import { Layout, PlayerCanvas } from "./components/atoms";

export const VideoEditor = () => {
  const [{ playing, videoTrackBuffers }, setControllerState] = useState(
    VideoController.buildDefaultState(),
  );
  const [{ controller, reader }] = useState(() => {
    const controller = new VideoController({
      onEmit: (nextValues) =>
        setControllerState((oldValues) => ({ ...oldValues, ...nextValues })),
    });
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        (reader.result as any).fileStart = 0;
        controller.setVideoArrayBuffer(reader.result);
      }
    };
    return { controller, reader };
  });

  useHotkeys("right", () => controller.playForward(), []);
  useHotkeys("left", () => controller.playBackward(), []);
  useHotkeys(
    "space",
    () => (playing ? controller.pause() : controller.play()),
    [playing],
  );

  return (
    <Layout.Box>
      <Layout.Controls></Layout.Controls>
      <Layout.Player>
        <div style={{ flex: "1", width: "100%" }}>
          <PlayerCanvas ref={controller.setCanvasBox} />
        </div>
      </Layout.Player>
      <Layout.Track></Layout.Track>
    </Layout.Box>
  );
};
