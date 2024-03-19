import { style } from "@vanilla-extract/css";

import { tokens } from "~/ui-tokens";

export const sectionBoxStyles = style({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  paddingBlock: tokens.spacings["5"],
  paddingInline: tokens.spacings["7"],
  gap: tokens.spacings["6"],
  overflowY: "auto",
});

export const titleStyles = style({
  color: tokens.colors["white100"],
  fontSize: "22px",
  fontWeight: "normal",
});
