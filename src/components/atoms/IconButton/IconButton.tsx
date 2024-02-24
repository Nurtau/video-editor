import {
  PlayArrow,
  Pause,
  FastForward,
  FastRewind,
  Add,
  Remove,
  Download,
  ChangeCircle,
} from "@mui/icons-material/";
import { iconButtonStyles } from "./IconButton.css";

const ICONS = {
  play: PlayArrow,
  pause: Pause,
  playForward: FastForward,
  playBackward: FastRewind,
  plus: Add,
  minus: Remove,
  download: Download,
  changeCircle: ChangeCircle,
};

interface IconButtonProps {
  name: keyof typeof ICONS;
  onClick(): void;
  disabled?: boolean;
  color?: string;
}

export const IconButton = ({
  name,
  onClick,
  disabled,
  color = "white",
}: IconButtonProps) => {
  const IconComponent = ICONS[name];
  return (
    <button
      className={iconButtonStyles}
      style={{ color }}
      onClick={onClick}
      disabled={disabled}
    >
      <IconComponent fontSize={"large"} />
    </button>
  );
};
