import { style } from "@vanilla-extract/css";
import { tokens } from "~/ui-tokens";

import { TIMELINE_PADDING } from "~/constants";

export const trackBoxStyles = style({
  height: "60px",
  display: "flex",
  position: "relative",
  alignItems: "center",
  paddingLeft: TIMELINE_PADDING.LEFT,
  paddingRight: TIMELINE_PADDING.RIGHT,
  ":before": {
    content: "",
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    width: "100%",
    height: "1px",
    backgroundColor: "rgba(39, 41, 52, 1)",
  },
});

export const trackStyles = style({
  position: "relative",
  display: "flex",
});

export const sliderBoxStyles = style({
  paddingTop: tokens.spacings["4"],
  display: "flex",
  flexDirection: "column",
});
