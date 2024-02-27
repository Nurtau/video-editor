import { style } from "@vanilla-extract/css";
import { tokens } from "~/ui-tokens";

export const boxStyles = style({
  height: "100%",
  width: "100%",
  display: "grid",
  gap: tokens.spacings["7"],
  padding: tokens.spacings["7"],
  paddingTop: tokens.spacings["12"],
  gridTemplateRows: "1fr 420px",
  gridTemplateColumns: "532px 1fr",
  gridTemplateAreas: "'controls player'" + "'track track'",
});

export const playerStyles = style({
  gridArea: "player",
});

export const controlsStyles = style({
  gridArea: "controls",
});

export const trackStyles = style({
  gridArea: "track",
});
