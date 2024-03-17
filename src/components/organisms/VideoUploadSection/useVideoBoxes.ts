import { useContext } from "react";

import {
  VideoBoxesContext,
  type VideoBoxesContextState,
} from "./VideoBoxesContext";

export const useVideoBoxes = (): VideoBoxesContextState => {
  const value = useContext(VideoBoxesContext);

  if (!value) {
    throw new Error("useVideoBoxes should be used within VideoBoxesProvider");
  }

  return value;
};
