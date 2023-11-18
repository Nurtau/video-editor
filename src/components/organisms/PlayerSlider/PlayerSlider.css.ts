import { style } from "@vanilla-extract/css";

export const sliderBoxStyles = style({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  width: "max-content",
});

export const tracksBoxStyles = style({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
});
