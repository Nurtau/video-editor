import { style } from "@vanilla-extract/css";

export const videoTimeBoxStyles = style({
  display: "flex",
  gap: "10px",
  justifyContent: "center",
  alignItems: "center",
  color: "white",
});

export const currentTimeStyles = style({
  color: "hsl(0, 0%, 70%)",
});

export const totalDurationStyles = style({
  color: "hsl(0, 0%, 50%)",
});

export const slashStyles = style([totalDurationStyles]);
