import { useState } from "react";

import { VideoController } from "./lib/VideoController";
import {
  Layout,
  PlayerCanvas,
  IconButton,
  FileUploadButton,
} from "./components/atoms";
import { SliderWidget } from "./components/organisms";

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
          }}
        >
          <PlayerCanvas ref={controller.setCanvasBox} />
          <div style={{ display: "inline-block" }}>
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
        <div
          style={{
            width: "100%",
            height: "20%",
            borderBottom: "1.5px solid #2c2c31",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1 }}>1</div>
          <div
            style={{
              display: "flex",
              flex: 1,
              gap: "10px",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
            }}
            ref={controller.setTimeBox}
          >
            <div>0:00.00</div>
            <div>/</div>
            <div>0:00.00</div>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
            }}
          >
            <IconButton name="plus" onClick={controller.playForward} />
            <IconButton name="minus" onClick={controller.playForward} />
          </div>
        </div>
        <div
          style={{
            maxWidth: "100%",
            overflowX: "scroll",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "80%",
          }}
        >
          <SliderWidget videoTrackBuffers={videoTrackBuffers} />
        </div>
      </Layout.Track>
    </Layout.Box>
  );
}

export default App;
