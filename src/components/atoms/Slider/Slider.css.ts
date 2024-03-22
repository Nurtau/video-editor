import { style } from "@vanilla-extract/css";
import { tokens } from "~/ui-tokens";

export const sliderBoxStyles = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.spacings["3"],
});

export const headerBoxStyles = style({
  display: "flex",
  justifyContent: "space-between",
});

export const titleStyles = style({
  color: tokens.colors["white50"],
  fontSize: 14,
});

export const valueTextStyles = style({
  color: tokens.colors["white50"],
  fontSize: 14,
});

const sliderBg = "rgba(110, 142, 255, 1)";
const sliderRadius = tokens.borderRadiuses["1.5"];
const sliderHeight = 8;
const thumbSize = 20;

const sliderThumbStyles = {
  WebkitAppearance: "none",
  width: thumbSize,
  height: thumbSize,
  marginTop: sliderHeight / 2 - thumbSize / 2,
  backgroundColor: sliderBg,
  borderRadius: "50%",
  cursor: "pointer",
} as const;

const sliderTrackStyles = {
  width: "100%",
  height: sliderHeight,
  backgroundColor: "transparent",
  borderRadius: sliderRadius,
} as const;

export const sliderStyles = style({
  WebkitAppearance: "none",
  appearance: "none",
  width: "100%",
  height: sliderHeight,
  backgroundColor: "rgba(218, 189, 255, 1)",
  borderRadius: sliderRadius,
  backgroundImage: `linear-gradient(${sliderBg}, ${sliderBg})`,
  backgroundSize: "0% 100%",
  backgroundRepeat: "no-repeat",
  "::-webkit-slider-thumb": sliderThumbStyles,
  "::-webkit-slider-runnable-track": sliderTrackStyles,
  "::-moz-range-thumb": sliderThumbStyles,
  "::-moz-range-track": sliderTrackStyles,
});
