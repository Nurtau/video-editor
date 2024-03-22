import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

import { Z_INDEXES } from "~/constants";
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

export const trimMovingThumbBoxStyles = style({
  position: "absolute",
  zIndex: Z_INDEXES.TIMELINE_TRACK,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
});

export const trimMovingThumbStyles = style({
  position: "absolute",
  width: 1,
  top: 0,
  bottom: 0,
  backgroundColor: tokens.colors["white100"],
  display: "none",
});
