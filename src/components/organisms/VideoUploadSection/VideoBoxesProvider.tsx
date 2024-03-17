import { useState, useMemo, type ReactNode } from "react";

import {
  VideoBoxesContext,
  type VideoBoxesContextState,
} from "./VideoBoxesContext";
import { type ExtendedVideoBox } from "./VideoBoxItem";

interface VideoBoxesProviderProps {
  children: ReactNode;
}

export const VideoBoxesProvider = ({ children }: VideoBoxesProviderProps) => {
  const [videoBoxes, setVideoBoxes] = useState<ExtendedVideoBox[]>([]);

  const contextState: VideoBoxesContextState = useMemo(
    () => ({
      videoBoxes,
      setVideoBoxes,
    }),
    [videoBoxes],
  );

  return (
    <VideoBoxesContext.Provider value={contextState}>
      {children}
    </VideoBoxesContext.Provider>
  );
};
