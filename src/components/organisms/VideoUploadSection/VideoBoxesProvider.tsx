import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";

import { type ExtendedVideoBox } from "./VideoBoxItem";

interface VideoBoxesContextState {
  videoBoxes: ExtendedVideoBox[];
  setVideoBoxes(nextVideoBoxes: ExtendedVideoBox[]): void;
}

const VideoBoxesContext = createContext<VideoBoxesContextState | null>(null);

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

export const useVideoBoxes = (): VideoBoxesContextState => {
  const value = useContext(VideoBoxesContext);

  if (!value) {
    throw new Error("useVideoBoxes should be used within VideoBoxesProvider");
  }

  return value;
};
