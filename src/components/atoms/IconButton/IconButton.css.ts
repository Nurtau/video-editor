import { style } from "@vanilla-extract/css";

export const iconButtonStyles = style({
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "5px",
  ":disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  selectors: {
    "&:hover:not([disabled])": {
      color: "#ccc",
    },
  },
});
