import { useState } from "react";

import { VideoController } from "./lib/VideoController";
import { Layout } from "./components/Layout";

import "./globalStyles.css";

function App() {
  const [{ controller, reader }] = useState(() => {
    const controller = new VideoController();
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
          <canvas
            ref={controller.setCanvas}
            style={{
              width: "90%",
              height: "80%",
              backgroundColor: "red",
              display: "block",
              lineHeight: 0,
            }}
          />
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
