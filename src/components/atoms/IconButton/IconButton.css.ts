import { createVar } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { tokens } from "~/ui-tokens";

export const iconColorVar = createVar();
export const iconActiveColorVar = createVar();
export const bgColorVar = createVar();
export const bgHoverColorVar = createVar();

export const iconButtonStyles = recipe({
  base: {
    backgroundColor: bgColorVar,
    color: iconColorVar,
    border: "none",
    borderRadius: tokens.borderRadiuses["2.5"],
    cursor: "pointer",
    transition: "background-color 0.2s ease-in-out",
    ":hover": {
      backgroundColor: bgHoverColorVar,
    },
    ":disabled": {
      cursor: "disabled",
    },
  },
  variants: {
    active: {
      true: {
        color: iconActiveColorVar,
        borderInline: "1px solid currentcolor",
      },
      false: {
        borderInline: "1px solid transparent",
      },
    },
  },
});
