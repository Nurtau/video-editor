import { style } from "@vanilla-extract/css";

export const boxStyles = style({
  height: "100%",
  width: "100%",
  display: "grid",
  gap: "24px",
  gridTemplateRows: "1fr 260px",
  gridTemplateColumns: "400px 1fr",
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
