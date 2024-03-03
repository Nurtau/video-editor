import { type ReactNode } from "react";

import { buttonStyles, ButtonStylesVariants } from "./Button.css";

type ButtonProps = {
  children: ReactNode;
  onClick(): void;
  disabled?: boolean;
} & ButtonStylesVariants;

export const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}: ButtonProps) => {
  return (
    <button
      type="button"
      className={buttonStyles({ variant })}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
