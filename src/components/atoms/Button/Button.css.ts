import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";

import { tokens } from "~/ui-tokens";

export const buttonStyles = recipe({
  base: {
    flex: 1,
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "bold",
    borderRadius: tokens.borderRadiuses["1.5"],
    paddingBlock: tokens.spacings["3"],
    paddingInline: tokens.spacings["5"],
    color: tokens.colors["white100"],
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":disabled": {
      cursor: "not-allowed",
    },
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: tokens.colors["bright-blue"],
        border: `2px solid ${tokens.colors["bright-blue"]}`,

        ":disabled": {
          backgroundColor: tokens.colors["pale-blue"],
          border: `2px solid ${tokens.colors["pale-blue"]}`,
        },

        selectors: {
          "&:hover:not(:disabled)": {
            backgroundColor: "rgba(70, 110, 255, 1)",
            border: "2px solid rgba(70, 110, 255, 1)",
          },
        },
      },
      secondary: {
        backgroundColor: "rgba(56, 58, 68, 1)",
        border: "2px solid rgba(88, 91, 105, 1)",

        ":disabled": {
          color: tokens.colors["white50"],
          border: "2px solid rgba(56, 58, 68, 1)",
        },

        selectors: {
          "&:hover:not(:disabled)": {
            backgroundColor: "rgba(70, 72, 82, 1)",
          },
        },
      },
    },
  },
});

export type ButtonStylesVariants = RecipeVariants<typeof buttonStyles>;
