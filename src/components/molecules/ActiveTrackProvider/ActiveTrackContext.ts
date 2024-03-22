import { type VideoTrackBuffer } from "~/lib/VideoTrackBuffer";

import { createContext } from "react";

export interface ActiveTrackContextState {
  activeTrack: VideoTrackBuffer | null;
  setActiveTrack(nextTrack: VideoTrackBuffer | null): void;
}

export const ActiveTrackContext = createContext<ActiveTrackContextState | null>(
  null,
);
