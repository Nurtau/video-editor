import { style } from "@vanilla-extract/css";
import { tokens } from "~/ui-tokens";

const HEADER_WIDTH = 60;

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
  height: HEADER_WIDTH,
});

export const sliderBoxStyles = style({
  flex: 1,
  borderTop: `solid 2px ${tokens.colors["secondary-border"]}`,
  backgroundColor: tokens.colors["main-bg"],
  minWidth: "100%",
  width: "max-content",
});

export const zoomingControlsBoxStyles = style({
  height: HEADER_WIDTH,
  position: "absolute",
  right: 2,
  top: 2,
  borderTopRightRadius: tokens.borderRadiuses["2.5"],
  display: "flex",
  flexDirection: "row",
  backgroundColor: tokens.colors["secondary-bg"],
  borderLeft: `1px solid ${tokens.colors["secondary-border"]}`,
  paddingInline: tokens.spacings["1"],
  ":before": {
    content: "",
    display: "block",
    position: "absolute",
    width: 10,
    backgroundColor: tokens.colors["secondary-bg"],
    left: -11,
    top: 0,
    bottom: 0,
  },
});
