import { style } from "@vanilla-extract/css";

export const boxStyles = style({
  height: "100%",
  width: "100%",
  display: "grid",
  gridTemplateRows: "repeat(5, 1fr)",
  gridTemplateColumns: "repeat(5, 1fr)",
  gridTemplateAreas:
    "'controls controls player player player'" +
    "'controls controls player player player'" +
    "'controls controls player player player'" +
    "'track track track track track'" +
    "'track track track track track'",
});

export const playerStyles = style({
  gridArea: "player",
  backgroundColor: "#151419",
});

export const controlsStyles = style({
  gridArea: "controls",
  backgroundColor: "#151419",
});

export const trackStyles = style({
  gridArea: "track",
  backgroundColor: "#201f24",
});
