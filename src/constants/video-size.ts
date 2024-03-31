export const RATIOS = ["16:9", "21:9", "1:1", "4:3"] as const;
export type RatioKey = (typeof RATIOS)[number];
export const DEFAULT_RATIO: RatioKey = "16:9";

interface RatioResolutionItem {
  resolutions: string[];
  preffered: string;
}

export const RATIO_RESOLUTIONS: Record<RatioKey, RatioResolutionItem> = {
  "16:9": {
    preffered: "1920x1080",
    resolutions: [
      "640x360",
      "854x480",
      "1280x720",
      "1920x1080",
      "2560x1440",
      "3840x2160",
    ],
  },
  "21:9": {
    preffered: "1920x800",
    resolutions: ["1280x536", "1600x672", "1920x800", "2560x1080", "3840x1600"],
  },
  "1:1": {
    preffered: "720x720",
    resolutions: ["240x240", "360x360", "480x480", "720x720", "1080x1080"],
  },
  "4:3": {
    preffered: "1280x960",
    resolutions: ["800x600", "1024x768", "1280x960", "1400x1050", "1600x1200"],
  },
};
