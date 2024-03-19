import { useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { VideoTrackBuffer } from "./lib/VideoTrackBuffer";
import { VideoController } from "./lib/VideoController";
import { Layout, PlayerCanvas, Sidebar } from "./components/atoms";
import {
  VideoUploadSection,
  VideoEffectsSection,
  PlayerTimeline,
} from "./components/organisms";
import { PlayerControls, useActiveTrack } from "./components/molecules";

type SidebarKey =
  | "videos-upload"
  | "video-settings"
  | "effects"
  | "video-export";

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

  const [activeSidebarKey, setActiveSidebarKey] =
    useState<SidebarKey>("videos-upload");
  const { activeTrack } = useActiveTrack();

  useEffect(() => {
    if (!activeTrack) return;
    setActiveSidebarKey("effects");
  }, [activeTrack]);

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
        <Sidebar<SidebarKey>
          activeKey={activeSidebarKey}
          setActiveKey={setActiveSidebarKey}
          items={[
            {
              icon: "Camera",
              key: "videos-upload",
              content: () => (
                <VideoUploadSection
                  onMoveToTimeline={(box) => {
                    setVideoTrackBuffers((buffers) => {
                      const newBuffers = box.videoTrackBuffers.map((buffer) =>
                        buffer.copy(),
                      );
                      return [...buffers, ...newBuffers];
                    });
                  }}
                />
              ),
            },
            {
              icon: "Sliders",
              key: "video-settings",
              content: () => <div>VIDEO-settings</div>,
            },
            {
              icon: "PaintBrush",
              key: "effects",
              content: () => <VideoEffectsSection />,
            },
            {
              icon: "Merge",
              key: "video-export",
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
        <PlayerTimeline
          videoTrackBuffers={videoTrackBuffers}
          seek={controller.seek}
        />
      </Layout.Track>
    </Layout.Box>
  );
};
