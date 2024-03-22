import { useMemo, useState, type ReactNode } from "react";

import { VideoTrackBuffer } from "~/lib/VideoTrackBuffer";
import {
  ActiveTrackContext,
  type ActiveTrackContextState,
} from "./ActiveTrackContext";

interface ActiveTrackProviderProps {
  children: ReactNode;
}

export const ActiveTrackProvider = ({ children }: ActiveTrackProviderProps) => {
  const [activeTrack, setActiveTrack] = useState<VideoTrackBuffer | null>(null);

  const value: ActiveTrackContextState = useMemo(
    () => ({
      activeTrack,
      setActiveTrack,
    }),
    [activeTrack],
  );

  return (
    <ActiveTrackContext.Provider value={value}>
      {children}
    </ActiveTrackContext.Provider>
  );
};
