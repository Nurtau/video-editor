import { useState, useMemo, type ReactNode } from "react";
import { DEFAULT_RATIO, RATIO_RESOLUTIONS } from "~/constants";

import { VideoSettingsContext, type Settings } from "./VideoSettingsContext";

interface VideoSettingsProviderProps {
  children: ReactNode;
}

export const VideoSettingsProvider = ({
  children,
}: VideoSettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>({
    ratio: DEFAULT_RATIO,
    resolution: RATIO_RESOLUTIONS[DEFAULT_RATIO].preffered,
  });

  const contextValue = useMemo(
    () => ({
      settings,
      setSettings: (value: Partial<Settings>) =>
        setSettings((settings) => ({ ...settings, ...value })),
    }),
    [settings],
  );
  return (
    <VideoSettingsContext.Provider value={contextValue}>
      {children}
    </VideoSettingsContext.Provider>
  );
};
