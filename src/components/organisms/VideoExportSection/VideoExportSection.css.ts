import { style } from "@vanilla-extract/css";

import { Z_INDEXES } from "~/constants";
import { tokens } from "~/ui-tokens";

export const sectionBoxStyles = style({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  paddingBlock: tokens.spacings["5"],
  paddingInline: tokens.spacings["7"],
  gap: tokens.spacings["8"],
  overflowY: "auto",
});

export const titleStyles = style({
  color: tokens.colors["white100"],
  fontSize: "22px",
  fontWeight: "normal",
});

export const contentBoxStyles = style({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  justifyContent: "space-between",
  gap: tokens.spacings["8"],
});

export const contentLabelStyles = style({
  color: tokens.colors["white50"],
  fontSize: "14px",
  lineHeight: 1.6,
});

export const resolutionStyles = style({
  color: "rgba(0, 155, 255, 0.8)",
});

export const ratioStyles = style({
  color: "rgba(0, 255, 150, 0.8)",
});

export const exportButtonBoxStyles = style({
  display: "flex",
  justifyContent: "center",
});

export const overlayBoxStyles = style({
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: Z_INDEXES.EXPORT_OVERLAY_BOX,
  width: "100vw",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: tokens.colors["main-bg"],
  gap: tokens.spacings["12"],
  padding: tokens.spacings["4"],
});

export const exportingCenterBoxStyles = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.spacings["8"],
  alignItems: "center",
});

export const exportingCenterTitleStyles = style({
  color: tokens.colors["pale-blue"],
  fontSize: 16,
});

export const exportingButtonBoxStyles = style({
  width: "100%",
  display: "flex",
  justifyContent: "center",
  gap: tokens.spacings["5"],
  paddingBottom: tokens.spacings["10"],
});
