import { useState } from "react";

import { VideoController } from "./lib/VideoController";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Layout,
  PlayerCanvas,
  IconButton,
  FileUploadButton,
} from "./components/atoms";
import { PlayerSlider, PlayerBottomControls } from "./components/organisms";

import "./globalStyles.css";

function App() {
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
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "#8a8a8c",
              paddingBottom: "15px",
              textAlign: "center",
            }}
          >
            Upload a mp4 file to get started.
          </div>
          <FileUploadButton onUpload={(file) => reader.readAsArrayBuffer(file)}>
            Upload
          </FileUploadButton>
          <IconButton
            name="download"
            onClick={controller.exportVideo}
            disabled={!videoTrackBuffers.length}
          />
          <IconButton
            name="changeCircle"
            onClick={controller.changeFrameFilters}
          />
        </div>
      </Layout.Controls>
      <Layout.Player>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            flexDirection: "column",
            padding: "16px",
            paddingTop: "64px",
            gap: "16px",
          }}
        >
          <div style={{ flex: "1", width: "100%" }}>
            <PlayerCanvas ref={controller.setCanvasBox} />
          </div>
          <div>
            <IconButton
              name="playBackward"
              onClick={controller.playBackward}
              disabled={!videoTrackBuffers.length}
            />
            <IconButton
              name={playing ? "pause" : "play"}
              onClick={playing ? controller.pause : controller.play}
              disabled={!videoTrackBuffers.length}
            />
            <IconButton
              name="playForward"
              onClick={controller.playForward}
              disabled={!videoTrackBuffers.length}
            />
          </div>
        </div>
      </Layout.Player>
      <Layout.Track>
        <PlayerBottomControls
          renderPlayerSlider={(timeToPx) => (
            <PlayerSlider
              timeToPx={timeToPx}
              videoTrackBuffers={videoTrackBuffers}
              seek={controller.seek}
            />
          )}
        />
      </Layout.Track>
    </Layout.Box>
  );
}

export default App;