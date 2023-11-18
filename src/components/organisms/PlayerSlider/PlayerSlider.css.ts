import { style } from "@vanilla-extract/css";

export const sliderBoxStyles = style({
  height: "100%",
  paddingLeft: "32px",
  paddingRight: "32px",
  display: "flex",
  flexDirection: "column",
});

export const tracksBoxStyles = style({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
});
