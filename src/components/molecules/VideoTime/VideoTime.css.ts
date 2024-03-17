import { style } from "@vanilla-extract/css";
import { tokens } from "~/ui-tokens";

export const videoTimeBoxStyles = style({
  display: "flex",
  gap: tokens.spacings["1"],
  justifyContent: "center",
  alignItems: "center",
  fontSize: 14,
  color: "white",
});

export const currentTimeStyles = style({
  color: tokens.colors["white100"],
});

export const totalDurationStyles = style({
  color: tokens.colors["white50"],
});

export const slashStyles = style([totalDurationStyles]);
