import { style } from "@vanilla-extract/css";
import { tokens } from "~/ui-tokens";

export const playerControlsStyles = style({
  position: "absolute",
  bottom: tokens.spacings["6"],
  left: tokens.spacings["12"],
  right: tokens.spacings["12"],
  display: "flex",
});

const controlBoxStyles = style({
  backgroundColor: "rgba(54, 54, 54, 1)",
  borderRadius: tokens.borderRadiuses["3"],
  paddingBlock: tokens.spacings["3"],
  paddingInline: tokens.spacings["4"],
  display: "flex",
  alignItems: "center",
  maxWidth: "max-content",
});

export const firstControlsStyles = style([
  controlBoxStyles,
  {
    gap: tokens.spacings["2"],
  },
]);

export const secondControlsStyles = style([
  controlBoxStyles,
  {
    marginLeft: tokens.spacings["7"],
    gap: tokens.spacings["3"],
  },
]);
