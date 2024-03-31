import { useContext } from "react";

import { VideoSettingsContext } from "./VideoSettingsContext";

export const useVideoSettings = () => {
  const context = useContext(VideoSettingsContext);

  if (!context) {
    throw new Error(
      "useVideoSettings should be used within VideoSettingsProvider",
    );
  }

  return context;
};
