import { useState, useMemo, useEffect, type ReactNode } from "react";
import { DEFAULT_RATIO, RATIO_RESOLUTIONS } from "~/constants";
import type { Settings } from "~/types";
import { storage } from "~/lib/Storage";

import { VideoSettingsContext } from "./VideoSettingsContext";

interface VideoSettingsProviderProps {
  children: ReactNode;
}

export const VideoSettingsProvider = ({
  children,
}: VideoSettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const cachedSettings = storage.getSettings();

    if (!cachedSettings) {
      return {
        ratio: DEFAULT_RATIO,
        resolution: RATIO_RESOLUTIONS[DEFAULT_RATIO].preffered,
      };
    }

    return cachedSettings;
  });

  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

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
