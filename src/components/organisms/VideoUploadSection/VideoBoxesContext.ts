import { createContext } from "react";

import { type VideoUploadBox } from "./VideoBoxItem";

export interface VideoBoxesContextState {
  videoBoxes: VideoUploadBox[];
  setVideoBoxes(nextVideoBoxes: VideoUploadBox[]): void;
}

export const VideoBoxesContext = createContext<VideoBoxesContextState | null>(
  null,
);
