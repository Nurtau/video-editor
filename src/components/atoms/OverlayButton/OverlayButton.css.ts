import { createVar, style } from "@vanilla-extract/css";

export const bgColorVar = createVar();
export const bgHoverColorVar = createVar();

export const overlayButtonStyles = style({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
  backgroundColor: bgColorVar,
  ":hover": {
    backgroundColor: bgHoverColorVar,
  },
});
