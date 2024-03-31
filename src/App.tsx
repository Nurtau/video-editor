import "./globalStyles.css";

import { ActiveTrackProvider } from "./components/molecules";
import {
  VideoBoxesProvider,
  VideoSettingsProvider,
} from "./components/organisms";
import { VideoEditor } from "./VideoEditor";

function App() {
  return (
    <VideoBoxesProvider>
      <VideoSettingsProvider>
        <ActiveTrackProvider>
          <VideoEditor />
        </ActiveTrackProvider>
      </VideoSettingsProvider>
    </VideoBoxesProvider>
  );
}

export default App;
