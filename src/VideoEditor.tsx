import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { VideoController } from "./lib/VideoController";
import { Layout, PlayerCanvas, Sidebar } from "./components/atoms";
import { PlayerSlider } from "./components/organisms";

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
      <Layout.Controls>
        <Sidebar
          items={[
            {
              icon: "Camera",
              value: "videos",
              content: () => <div>COOL</div>,
            },
            {
              icon: "Sliders",
              value: "video-settings",
              content: () => <div>VIDEO-settings</div>,
            },
            {
              icon: "PaintBrush",
              value: "effects",
              content: () => <div>VIDEO-effects</div>,
            },
            {
              icon: "Merge",
              value: "video-export",
              content: () => <div>VIDEO-export</div>,
            },
          ]}
        />
      </Layout.Controls>
      <Layout.Player>
        <div style={{ flex: "1", width: "100%" }}>
          <PlayerCanvas ref={controller.setCanvasBox} />
        </div>
      </Layout.Player>
      <Layout.Track>
        <PlayerSlider />
      </Layout.Track>
    </Layout.Box>
  );
};
