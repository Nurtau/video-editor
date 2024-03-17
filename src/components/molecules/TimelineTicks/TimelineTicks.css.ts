import { style } from "@vanilla-extract/css";
import { TIMELINE_PADDING_INLINE } from "~/constants";
import { tokens } from "~/ui-tokens";

export const ticksBoxStyles = style({
  position: "relative",
  height: "100%",
  marginLeft: TIMELINE_PADDING_INLINE,
});

export const tickBoxStyles = style({
  position: "absolute",
  transform: "translate(-50%, -50%)",
  top: "50%",
});

export const circlesBoxStyles = style({
  position: "absolute",
  transform: "translateY(-50%)",
  top: "50%",
  display: "flex",
  justifyContent: "space-evenly",
});

export const circleStyles = style({
  width: "1px",
  height: "1px",
  borderRadius: "50%",
  backgroundColor: tokens.colors["pale-blue"],
});

export const labelStyles = style({
  fontSize: 10,
  letterSpacing: "1px",
  color: tokens.colors["pale-blue"],
});
