import { Icon, type IconName } from "../Icon";

import { iconButtonStyles } from "./IconButton.css";

interface IconButtonProps {
  name: IconName;
  onClick(): void;
  disabled?: boolean;
}

export const IconButton = ({ name, onClick, disabled }: IconButtonProps) => {
  return (
    <button
      type="button"
      className={iconButtonStyles}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon name={name} />
    </button>
  );
};
