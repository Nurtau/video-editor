import { useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { VideoTrackBuffer } from "./lib/VideoTrackBuffer";
import { VideoController } from "./lib/VideoController";
import { eventsBus } from "./lib/EventsBus";
import { Layout, PlayerCanvas, Sidebar } from "./components/atoms";
import {
  VideoUploadSection,
  VideoEffectsSection,
  VideoExportSection,
  VideoSettingsSection,
  PlayerTimeline,
  useVideoSettings,
} from "./components/organisms";
import { PlayerControls, useActiveTrack } from "./components/molecules";

type SidebarKey =
  | "videos-upload"
  | "video-settings"
  | "effects"
  | "video-export";

export const VideoEditor = () => {
  const { settings } = useVideoSettings();
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
  const { activeTrack, setActiveTrack } = useActiveTrack();

  useEffect(() => {
    controller.setVideoSize(settings);
  }, [settings]);

  useEffect(() => {
    if (!activeTrack) return;
    setActiveSidebarKey("effects");
  }, [activeTrack]);

  useEffect(() => {
    if (!activeTrack) return;

    if (!videoTrackBuffers.includes(activeTrack)) {
      setActiveTrack(null);
    }
  }, [activeTrack, videoTrackBuffers]);

  useEffect(() => {
    // @TODO: there is a room for optimisation, because modifiedVideoTrackId returns a changed track
    return eventsBus.subscribe("modifiedVideoTrackId", () => {
      setVideoTrackBuffers((cur) => [...cur]);
    });
  }, []);

  useEffect(() => {
    return eventsBus.subscribe("deletedVideoTrackId", (id) => {
      setVideoTrackBuffers((curTracks) =>
        curTracks.filter((track) => track.id !== id),
      );
    });
  }, []);

  useEffect(() => {
    return eventsBus.subscribe("splittedVideoTrack", ({ id, atTime }) => {
      setVideoTrackBuffers((curTracks) => {
        const nextTracks: VideoTrackBuffer[] = [];

        curTracks.forEach((track) => {
          if (track.id === id) {
            nextTracks.push(...track.splitAt(atTime));
          } else {
            nextTracks.push(track);
          }
        });

        return nextTracks;
      });
    });
  }, []);

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
              content: () => <VideoSettingsSection />,
            },
            {
              icon: "PaintBrush",
              key: "effects",
              content: () => <VideoEffectsSection />,
            },
            {
              icon: "Export",
              key: "video-export",
              content: () => (
                <VideoExportSection
                  videoTrackBuffers={videoTrackBuffers}
                  onExportStart={() => {
                    controller.pause();
                  }}
                />
              ),
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
