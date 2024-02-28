import * as Icons from "./react-icons";

import { tokens, type ColorName } from "~/ui-tokens";

import { iconBoxStyles } from "./Icon.css";

export type IconName = keyof typeof Icons;

const SIZES = {
  xs: "24px",
  md: "26px",
  lg: "28px",
};

export type IconSizing = keyof typeof SIZES;

interface IconProps {
  name: IconName;
  color?: ColorName;
  size: IconSizing;
}

export const Icon = ({ name, color, size }: IconProps) => {
  const Component = Icons[name];

  return (
    <span
      className={iconBoxStyles}
      style={{
        color: color ? tokens.colors[color] : undefined,
        fontSize: SIZES[size],
      }}
    >
      <Component />
    </span>
  );
};
