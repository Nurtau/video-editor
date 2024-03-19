import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

import { tokens } from "~/ui-tokens";

export const trackBoxStyles = recipe({
  base: {
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
    position: "relative",
    borderRadius: tokens.borderRadiuses["2"],
  },
  variants: {
    active: {
      true: {
        outlineOffset: -1,
        outline: `1px solid ${tokens.colors["bright-blue"]}`,
      },
    },
  },
});

export const frameBoxStyles = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});
