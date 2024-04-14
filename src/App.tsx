import "./globalStyles.css";

import { FeatureDetectionGuard } from "./components/atoms";
import { ActiveVideoBoxProvider } from "./components/molecules";
import {
  VideoBoxesProvider,
  VideoSettingsProvider,
} from "./components/organisms";
import { VideoEditor } from "./VideoEditor";

function App() {
  return (
    <FeatureDetectionGuard>
      <VideoBoxesProvider>
        <VideoSettingsProvider>
          <ActiveVideoBoxProvider>
            <VideoEditor />
          </ActiveVideoBoxProvider>
        </VideoSettingsProvider>
      </VideoBoxesProvider>
    </FeatureDetectionGuard>
  );
}

export default App;
