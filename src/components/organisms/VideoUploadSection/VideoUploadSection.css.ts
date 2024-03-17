import { style } from "@vanilla-extract/css";

import { tokens } from "~/ui-tokens";

export const uploadSectionBoxStyles = style({
  height: "100%",
  display: "flex",
  flexDirection: "column",
});

export const videosBoxStyles = style({
  flex: 1,
  paddingBlock: tokens.spacings["5"],
  paddingInline: tokens.spacings["7"],
  display: "flex",
  flexDirection: "column",
  gap: tokens.spacings["6"],
  overflowY: "auto",
});

export const titleStyles = style({
  color: tokens.colors["white100"],
  fontSize: "22px",
  fontWeight: "normal",
});

export const videosListStyles = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
  gridGap: tokens.spacings["2"],
  rowGap: tokens.spacings["4"],
});

export const controlsBoxStyles = style({
  paddingBlock: tokens.spacings["5"],
  paddingInline: tokens.spacings["7"],
  backgroundColor: tokens.colors["tertiary-bg"],
  display: "flex",
  gap: tokens.spacings["5"],
  //boxShadow: "0 -2px 20px rgba(0, 0, 0, 0.5)",
});
