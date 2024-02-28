import { style } from "@vanilla-extract/css";
import { tokens } from "~/ui-tokens";

export const sliderBoxStyles = style({
  borderRadius: tokens.borderRadiuses["2.5"],
  backgroundColor: tokens.colors["secondary-bg"],
  border: `solid 2px ${tokens.colors["secondary-border"]}`,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
});

export const headerBoxStyles = style({
  height: "60px",
});

export const timelineBoxStyles = style({
  flex: 1,
  borderTop: `solid 2px ${tokens.colors["secondary-border"]}`,
  borderRadius: tokens.borderRadiuses["2.5"],
  backgroundColor: tokens.colors["main-bg"],
});
