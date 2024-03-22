import { assignInlineVars } from "@vanilla-extract/dynamic";
import { type MouseEvent, type CSSProperties } from "react";

import { tokens, type ColorName, type BorderRadius } from "~/ui-tokens";
import {
  overlayButtonStyles,
  bgColorVar,
  bgHoverColorVar,
} from "./OverlayButton.css";

interface OverlayButtonProps {
  onClick(event: MouseEvent<HTMLButtonElement>): void;
  bgColor?: ColorName;
  bgHoverColor?: ColorName;
  borderRadius?: BorderRadius;
  zIndex?: number;
  cursor?: CSSProperties["cursor"];
}

export const OverlayButton = ({
  onClick,
  bgColor = "transparent",
  bgHoverColor = "white50",
  borderRadius,
  zIndex,
  cursor,
}: OverlayButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={overlayButtonStyles}
      style={{
        cursor: cursor ? cursor : undefined,
        zIndex,
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
