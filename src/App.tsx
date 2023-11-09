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
      <Layout.Controls></Layout.Controls>
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
          <input
            type="file"
            onChange={(event) => {
              const files = event.target.files;
              if (files) {
                reader.readAsArrayBuffer(files[0]);
              }
            }}
          ></input>
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
            maxWidth: "100%",
            overflowX: "scroll",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
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
