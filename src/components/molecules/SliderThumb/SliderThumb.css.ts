import { style } from "@vanilla-extract/css";

export const thumbBoxStyles = style({
  position: "absolute",
  transform: "translateX(-50%)",
  height: "100%",
  width: "26px",
  backgroundColor: "rgba(83, 125, 218, 0.1)",
  display: "none",
  top: 0,
  bottom: 0,
  flexDirection: "column",
  alignItems: "center",
});

const blueColor = "rgba(83, 125, 218, 1)";

export const draggerStyles = style({
  width: "100%",
  height: "10px",
  clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
  backgroundColor: blueColor,
});

export const lineStyles = style({
  flex: 1,
  marginTop: "-5px",
  width: "2px",
  backgroundColor: blueColor,
});
