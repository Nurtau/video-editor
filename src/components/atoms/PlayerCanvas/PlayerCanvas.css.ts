import { style } from "@vanilla-extract/css";
import { tokens } from "~/ui-tokens";

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
    position: "relative",
    borderRadius: tokens.borderRadiuses["2.5"],
    overflow: "hidden",
  },
]);
