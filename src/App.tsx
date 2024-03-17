import "./globalStyles.css";

import { VideoBoxesProvider } from "./components/organisms";
import { VideoEditor } from "./VideoEditor";

function App() {
  return (
    <VideoBoxesProvider>
      <VideoEditor />
    </VideoBoxesProvider>
  );
}

export default App;
