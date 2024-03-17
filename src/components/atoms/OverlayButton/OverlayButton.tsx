import { assignInlineVars } from "@vanilla-extract/dynamic";

import { tokens, type ColorName, type BorderRadius } from "~/ui-tokens";
import {
  overlayButtonStyles,
  bgColorVar,
  bgHoverColorVar,
} from "./OverlayButton.css";

interface OverlayButtonProps {
  onClick(): void;
  bgColor?: ColorName;
  bgHoverColor?: ColorName;
  borderRadius?: BorderRadius;
}

export const OverlayButton = ({
  onClick,
  bgColor = "transparent",
  bgHoverColor = "white50",
  borderRadius,
}: OverlayButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={overlayButtonStyles}
      style={{
        borderRadius: borderRadius
          ? tokens.borderRadiuses[borderRadius]
          : undefined,
        ...assignInlineVars({
          [bgColorVar]: tokens.colors[bgColor],
          [bgHoverColorVar]: tokens.colors[bgHoverColor],
        }),
      }}
    />
  );
};
