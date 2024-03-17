import { style } from "@vanilla-extract/css";

import { tokens } from "~/ui-tokens";

export const boxItemStyles = style({
  padding: tokens.spacings["1"],
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: tokens.spacings["1"],
  alignItems: "center",
});

export const canvasBoxStyles = style({
  width: "100%",
  borderRadius: tokens.borderRadiuses["1.5"],
  overflow: "hidden",
});

export const canvasStyles = style({
  width: "100%",
  display: "block",
});

export const boxNameStyles = style({
  color: tokens.colors["white50"],
  maxWidth: "100%",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});
