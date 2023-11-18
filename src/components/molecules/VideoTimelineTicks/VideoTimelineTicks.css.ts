import { style } from "@vanilla-extract/css";

export const ticksBoxStyles = style({
  position: "relative",
  height: "12px",
});

export const tickBoxStyles = style({
  position: "absolute",
  transform: "translateX(-50%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2px",
});

export const tickStyles = style({
  height: "5px",
  width: "1px",
  backgroundColor: "white",
});

export const tickTimeTextStyles = style({
  fontSize: 10,
  color: "white",
});
