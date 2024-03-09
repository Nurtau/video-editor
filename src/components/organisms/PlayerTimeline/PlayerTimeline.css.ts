import { style } from "@vanilla-extract/css";
import { tokens } from "~/ui-tokens";

export const timelineBoxStyles = style({
  borderRadius: tokens.borderRadiuses["2.5"],
  backgroundColor: tokens.colors["secondary-bg"],
  border: `solid 2px ${tokens.colors["secondary-border"]}`,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  maxWidth: "100%",
  overflowX: "auto",
});

export const headerBoxStyles = style({
  height: "60px",
  position: "relative",
});

export const sliderBoxStyles = style({
  flex: 1,
  borderTop: `solid 2px ${tokens.colors["secondary-border"]}`,
  backgroundColor: tokens.colors["main-bg"],
  minWidth: "100%",
  width: "max-content",
});
