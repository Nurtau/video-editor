import { style } from "@vanilla-extract/css";

const centeringStyles = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export const playerCanvasOuterBoxStyles = style([
  centeringStyles,
  {
    width: "100%",
    height: "100%",
  },
]);

export const playerCanvasBoxStyles = style([
  centeringStyles,
  {
    backgroundColor: "black",
  },
]);
