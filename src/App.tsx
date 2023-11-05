import { useState } from "react";

import { VideoController } from "./lib/VideoController";

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
    <div>
      <input
        type="file"
        onChange={(event) => {
          const files = event.target.files;
          if (files) {
            reader.readAsArrayBuffer(files[0]);
          }
        }}
      ></input>
      <canvas ref={controller.setCanvas} />
    </div>
  );
}

export default App;
