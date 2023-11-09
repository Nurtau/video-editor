import { useState } from "react";

import { VideoController } from "./lib/VideoController";
import { Layout } from "./components/Layout";
import { PlayerCanvas } from "./components/PlayerCanvas";
import { IconButton } from "./components/IconButton";

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
          className="file-upload"
          style={{
            width: "80%",
            height: "80%",
            border: "1.5px solid #2c2c31",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ color: "#8a8a8c", paddingBottom: "15px" }}>
            Upload a mp4 file to get started.
          </div>
          <label className="custom-file-upload">
            <input
              type="file"
              onChange={(event) => {
                const files = event.target.files;
                if (files) {
                  reader.readAsArrayBuffer(files[0]);
                }
              }}
            ></input>
            Upload
          </label>
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
            ></IconButton>
            <IconButton
              name={playing ? "pause" : "play"}
              onClick={playing ? controller.pause : controller.play}
              disabled={!videoTrackBuffers.length}
            ></IconButton>
            <IconButton
              name="playForward"
              onClick={controller.playForward}
              disabled={!videoTrackBuffers.length}
            ></IconButton>
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
          <div
            style={{
              display: "flex",
              // justifyContent: "space-between",
              alignItems: "center",
              color: "white",
            }}
          >
            <div style={{ marginRight: "10px" }}>0:00.00</div>
            <div> / </div>
            <div style={{ marginLeft: "10px" }}>0:00.00</div>
          </div>
          <IconButton
            name={"zoomIn"}
            onClick={controller.playForward}
          ></IconButton>
          <IconButton
            name={"zoomOut"}
            onClick={controller.playForward}
          ></IconButton>
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
          <div
            ref={controller.setTrackPreviewerBox}
            style={{
              whiteSpace: "nowrap",
            }}
          ></div>
        </div>
      </Layout.Track>
    </Layout.Box>
  );
}

export default App;
