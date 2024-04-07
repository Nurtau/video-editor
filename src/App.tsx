import "./globalStyles.css";

import { ActiveVideoBoxProvider } from "./components/molecules";
import {
  VideoBoxesProvider,
  VideoSettingsProvider,
} from "./components/organisms";
import { VideoEditor } from "./VideoEditor";

function App() {
  return (
    <VideoBoxesProvider>
      <VideoSettingsProvider>
        <ActiveVideoBoxProvider>
          <VideoEditor />
        </ActiveVideoBoxProvider>
      </VideoSettingsProvider>
    </VideoBoxesProvider>
  );
}

export default App;
