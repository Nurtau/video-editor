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
