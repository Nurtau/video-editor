import { useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { AudioTrackBuffer } from "./lib/AudioTrackBuffer";
import { VideoBox } from "./lib/VideoBox";
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
import { PlayerControls, useActiveVideoBox } from "./components/molecules";

type SidebarKey =
  | "videos-upload"
  | "video-settings"
  | "effects"
  | "video-export";

export const VideoEditor = () => {
  const { settings } = useVideoSettings();
  const [videoBoxes, setVideoBoxes] = useState<VideoBox[]>([]);
  const [audioTrackBuffers, setAudioTrackBuffers] = useState<
    AudioTrackBuffer[]
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
  const { activeVideoBox, setActiveVideoBox } = useActiveVideoBox();

  useEffect(() => {
    controller.setVideoSize(settings);
  }, [settings]);

  useEffect(() => {
    if (!activeVideoBox) return;
    setActiveSidebarKey("effects");
  }, [activeVideoBox]);

  useEffect(() => {
    if (!activeVideoBox) return;

    if (!videoBoxes.includes(activeVideoBox)) {
      setActiveVideoBox(null);
    }
  }, [activeVideoBox, videoBoxes]);

  useEffect(() => {
    // @TODO: there is a room for optimisation, because modifiedVideoTrackId returns a changed track
    return eventsBus.subscribe("modifiedVideoBoxId", () => {
      setVideoBoxes((cur) => [...cur]);
    });
  }, []);

  useEffect(() => {
    return eventsBus.subscribe("deletedVideoBoxId", (id) => {
      setVideoBoxes((curTracks) =>
        curTracks.filter((track) => track.id !== id),
      );
    });
  }, []);

  useEffect(() => {
    return eventsBus.subscribe("splittedVideoBox", ({ id, atTime }) => {
      setVideoBoxes((curBoxes) => {
        const nextBoxes: VideoBox[] = [];

        curBoxes.forEach((box) => {
          if (box.id === id) {
            nextBoxes.push(...box.splitAt(atTime));
          } else {
            nextBoxes.push(box);
          }
        });

        return nextBoxes;
      });
    });
  }, []);

  useEffect(() => {
    controller.setVideoBoxes(videoBoxes);
  }, [videoBoxes]);

  useEffect(() => {
    controller.setAudioTrackBuffers(audioTrackBuffers);
  }, [audioTrackBuffers]);

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
                    setVideoBoxes((curBoxes) => {
                      return [...curBoxes, box.copy()];
                    });
                    setAudioTrackBuffers((buffers) => {
                      // @NOW: should be handled inside VideoBox, not seperate
                      const newBuffers = box
                        .getAudioTrackBuffers()
                        .map((buffer) => buffer);
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
                  videoBoxes={videoBoxes}
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
          {videoBoxes.length > 0 && (
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
        <PlayerTimeline videoBoxes={videoBoxes} seek={controller.seek} />
      </Layout.Track>
    </Layout.Box>
  );
};
