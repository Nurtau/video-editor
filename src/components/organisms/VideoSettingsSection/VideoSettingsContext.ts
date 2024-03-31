import { createContext } from "react";
import { type RatioKey } from "~/constants";

export interface Settings {
  ratio: RatioKey;
  resolution: string;
}

export interface VideoSettingsContextState {
  settings: Settings;
  setSettings(settings: Partial<Settings>): void;
}

export const VideoSettingsContext =
  createContext<VideoSettingsContextState | null>(null);
