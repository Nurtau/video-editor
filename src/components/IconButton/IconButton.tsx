import {
  PlayArrow,
  Pause,
  FastForward,
  FastRewind,
  Add,
  Remove,
} from "@mui/icons-material/";
import { iconButtonStyles } from "./IconButton.css";

const ICONS = {
  play: PlayArrow,
  pause: Pause,
  playForward: FastForward,
  playBackward: FastRewind,
  zoomIn: Add,
  zoomOut: Remove,
};

interface IconButtonProps {
  name: keyof typeof ICONS;
  onClick(): void;
  disabled?: boolean;
}

export const IconButton = ({ name, onClick, disabled }: IconButtonProps) => {
  const IconComponent = ICONS[name];
  return (
    <button className={iconButtonStyles} onClick={onClick} disabled={disabled}>
      <IconComponent fontSize={"large"} />
    </button>
  );
};
