import { style } from "@vanilla-extract/css";
import { tokens } from "~/ui-tokens";
import { Z_INDEXES } from "~/constants";

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
  width: "max-content",
  minWidth: "100%",
});

export const sliderInnerBoxStyles = style({
  position: "relative",
  height: "100%",
  width: "max-content",
  minWidth: "100%",
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

export const timelineControlsBoxStyles = style({
  position: "absolute",
  zIndex: Z_INDEXES.TIMELINE_CONTROLS,
  width: "68px",
  top: HEADER_WIDTH + 14,
  left: 12,
  bottom: 12,
  backgroundColor: tokens.colors["secondary-bg"],
  borderRadius: tokens.borderRadiuses["2.5"],
  border: `solid 2px ${tokens.colors["secondary-border"]}`,
  boxShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
  display: "flex",
  flexDirection: "column",
  paddingInline: tokens.spacings["1"],
  paddingBlock: tokens.spacings["1.5"],
  gap: tokens.spacings["1"],
});
