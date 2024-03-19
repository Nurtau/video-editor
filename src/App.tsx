import "./globalStyles.css";

import { ActiveTrackProvider } from "./components/molecules";
import { VideoBoxesProvider } from "./components/organisms";
import { VideoEditor } from "./VideoEditor";

function App() {
  return (
    <VideoBoxesProvider>
      <ActiveTrackProvider>
        <VideoEditor />
      </ActiveTrackProvider>
    </VideoBoxesProvider>
  );
}

export default App;
