import { useContext } from "react";

import { ActiveTrackContext, type ActiveTrackContextState } from "./ActiveTrackContext";

export const useActiveTrack = (): ActiveTrackContextState => {
  const value = useContext(ActiveTrackContext);

  if (!value) {
    throw new Error("useActiveTrack must be used within ActiveTrackProvider");
  }

  return value;
}
