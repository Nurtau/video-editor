import { style } from "@vanilla-extract/css";

import { tokens } from "~/ui-tokens";

export const sidebarBoxStyles = style({
  display: "flex",
  gap: tokens.spacings["3"],
  height: "100%",
});

const genericBoxStyles = style({
  backgroundColor: tokens.colors["secondary-bg"],
  borderRadius: tokens.borderRadiuses["2.5"],
  height: "100%",
  border: `solid 2px ${tokens.colors["secondary-border"]}`,
  boxShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
});

export const iconListStyles = style([
  genericBoxStyles,
  {
    width: "80px",
    padding: tokens.spacings["2"],
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacings["1"],
  },
]);

export const contextBoxStyles = style([
  genericBoxStyles,
  {
    flex: 1,
    overflow: "hidden",
  },
]);
