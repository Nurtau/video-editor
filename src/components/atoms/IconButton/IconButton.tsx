import { assignInlineVars } from "@vanilla-extract/dynamic";

import { tokens, type ColorName, type Spacing } from "~/ui-tokens";

import { Icon, type IconName, type IconSizing } from "../Icon";
import {
  iconButtonStyles,
  iconColorVar,
  iconActiveColorVar,
  bgColorVar,
  bgHoverColorVar,
} from "./IconButton.css";

interface IconButtonProps {
  name: IconName;
  iconSizing: IconSizing;
  iconColor?: ColorName;
  iconActiveColor?: ColorName;
  bgColor?: ColorName;
  bgHoverColor?: ColorName;
  disabled?: boolean;
  active?: boolean;
  onClick(): void;
  p?: Spacing;
}

export const IconButton = ({
  name,
  iconSizing,
  iconColor = "white100",
  iconActiveColor = iconColor,
  bgColor = "transparent",
  bgHoverColor = bgColor,
  active,
  p,
  onClick,
  disabled,
}: IconButtonProps) => {
  return (
    <button
      type="button"
      className={iconButtonStyles({ active })}
      style={{
        padding: p ? tokens.spacings[p] : undefined,
        ...assignInlineVars({
          [iconColorVar]: tokens.colors[iconColor],
          [iconActiveColorVar]: tokens.colors[iconActiveColor],
          [bgColorVar]: tokens.colors[bgColor],
          [bgHoverColorVar]: tokens.colors[bgHoverColor],
        }),
      }}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon name={name} size={iconSizing} />
    </button>
  );
};
