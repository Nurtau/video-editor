import { type VideoBox } from "~/lib/VideoBox";

import { createContext } from "react";

export interface ActiveVideoBoxContextState {
  activeVideoBox: VideoBox | null;
  setActiveVideoBox(nextVideoBox: VideoBox | null): void;
}

export const ActiveVideoBoxContext =
  createContext<ActiveVideoBoxContextState | null>(null);
