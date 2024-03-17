import { style } from "@vanilla-extract/css";
import { tokens } from "~/ui-tokens";

// @TODO: make it adaptive
export const boxStyles = style({
  height: "100%",
  width: "100%",
  display: "grid",
  gap: tokens.spacings["7"],
  padding: tokens.spacings["7"],
  gridTemplateRows: "1fr 360px",
  gridTemplateColumns: "532px 1fr",
  gridTemplateAreas: "'controls player'" + "'track track'",
});

export const playerStyles = style({
  gridArea: "player",
  minWidth: 0,
});

export const controlsStyles = style({
  gridArea: "controls",
  minHeight: 0,
});

export const trackStyles = style({
  gridArea: "track",
  position: "relative",
});
