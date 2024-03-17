import { createContext } from "react";

import { type ExtendedVideoBox } from "./VideoBoxItem";

export interface VideoBoxesContextState {
  videoBoxes: ExtendedVideoBox[];
  setVideoBoxes(nextVideoBoxes: ExtendedVideoBox[]): void;
}

export const VideoBoxesContext = createContext<VideoBoxesContextState | null>(
  null,
);
