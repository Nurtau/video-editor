import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

import { tokens } from "~/ui-tokens";

export const sectionBoxStyles = style({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  paddingBlock: tokens.spacings["5"],
  paddingInline: tokens.spacings["7"],
  gap: tokens.spacings["6"],
  overflowY: "auto",
});

export const titleStyles = style({
  color: tokens.colors["white100"],
  fontSize: "22px",
  fontWeight: "normal",
});

export const settingsBoxStyles = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.spacings["3"],
});

export const settingsTitleStyles = style({
  color: tokens.colors["white50"],
  width: "100%",
  fontWeight: "bold",
  fontSize: 14,
  paddingBottom: tokens.spacings["2"],
  borderBottom: `1px solid ${tokens.colors["white10"]}`,
});

const cardList = style({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
});

export const ratioCardList = style([
  cardList,
  {
    gap: tokens.spacings["5"],
  },
]);

const CARD_BOX_SIZE = 64;
const CARD_BOX_PADDING = 10;

const cardBoxStyles = recipe({
  base: {
    position: "relative",
    padding: CARD_BOX_PADDING,
    borderRadius: tokens.borderRadiuses["2"],
    overflow: "hidden",
  },
  variants: {
    active: {
      true: {
        backgroundColor: "rgba(64, 64, 80, 1)",
        color: tokens.colors["bright-blue"],
        border: "1px solid rgba(109, 141, 255, 0.5)",
      },
      false: {
        color: tokens.colors["pale-blue"],
        backgroundColor: "rgba(50, 52, 62, 1)",
        border: "1px solid transparent",
      },
    },
  },
});

export const ratioCardBoxStyles = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacings["1.5"],
  },
  variants: {
    active: {
      true: cardBoxStyles({ active: true }),
      false: cardBoxStyles({ active: false }),
    },
  },
});

export const RATIO_FIGURE_BOX_WIDTH = CARD_BOX_SIZE - CARD_BOX_PADDING * 2;
export const RATIO_FIGURE_BOX_HEIGHT = 28;

export const ratioFigureBoxStyles = style({
  width: RATIO_FIGURE_BOX_WIDTH,
  height: RATIO_FIGURE_BOX_HEIGHT,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export const ratioFigureStyles = style({
  border: "2px solid currentcolor",
  borderRadius: tokens.borderRadiuses["1"],
});

export const ratioCardTitleStyles = style({
  color: tokens.colors["pale-blue"],
  fontWeight: "bold",
  letterSpacing: 1.1,
});

export const resolutionCardBoxStyles = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    minWidth: 100,
  },
  variants: {
    active: {
      true: cardBoxStyles({ active: true }),
      false: cardBoxStyles({ active: false }),
    },
  },
});

export const resolutionTitleStyles = style({
  fontWeight: "bold",
  letterSpacing: 1.1,
});

export const resolutionCardList = style([
  cardList,
  {
    gap: tokens.spacings["3"],
  },
]);
