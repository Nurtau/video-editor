import { type ReactNode } from "react";

import { buttonStyles, ButtonStylesVariants } from "./Button.css";

type ButtonProps = {
  children: ReactNode;
  onClick(): void;
  disabled?: boolean;
  maxWidth?: string;
} & ButtonStylesVariants;

export const Button = ({
  children,
  onClick,
  disabled = false,
  maxWidth,
  variant = "primary",
}: ButtonProps) => {
  return (
    <button
      type="button"
      className={buttonStyles({ variant })}
      onClick={onClick}
      disabled={disabled}
      style={{
        maxWidth: maxWidth ? maxWidth : undefined,
      }}
    >
      {children}
    </button>
  );
};
