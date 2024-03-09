import { useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { VideoTrackBuffer } from "./lib/VideoTrackBuffer";
import { VideoController } from "./lib/VideoController";
import { Layout, PlayerCanvas, Sidebar } from "./components/atoms";
import { VideoUploadSection, PlayerTimeline } from "./components/organisms";
import { PlayerControls } from "./components/molecules";

export const VideoEditor = () => {
  const [videoTrackBuffers, setVideoTrackBuffers] = useState<
    VideoTrackBuffer[]
  >([]);

  const [{ playing }, setControllerState] = useState(
    VideoController.buildDefaultState(),
  );

  const [controller] = useState(() => {
    return new VideoController({
      onEmit: (nextValues) =>
        setControllerState((oldValues) => ({ ...oldValues, ...nextValues })),
    });
  });

  useEffect(() => {
    controller.setVideoTrackBuffers(videoTrackBuffers);
  }, [videoTrackBuffers]);

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
              content: () => (
                <VideoUploadSection
                  onMoveToTimeline={(box) => {
                    setVideoTrackBuffers((buffers) => [
                      ...buffers,
                      ...box.videoTrackBuffers,
                    ]);
                  }}
                />
              ),
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
        <PlayerCanvas ref={controller.setCanvasBox}>
          {videoTrackBuffers.length > 0 && (
            <PlayerControls
              playing={playing}
              play={controller.play}
              pause={controller.pause}
              playBackward={controller.playBackward}
              playForward={controller.playForward}
            />
          )}
        </PlayerCanvas>
      </Layout.Player>
      <Layout.Track>
        <PlayerTimeline videoTrackBuffers={videoTrackBuffers} />
      </Layout.Track>
    </Layout.Box>
  );
};
