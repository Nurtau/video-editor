import { forwardRef, type ReactNode } from "react";

import {
  playerCanvasOuterBoxStyles,
  playerCanvasBoxStyles,
} from "./PlayerCanvas.css";

interface PlayerCanvasProps {
  children: ReactNode;
}

export const PlayerCanvas = forwardRef<HTMLDivElement, PlayerCanvasProps>(
  ({ children }, ref) => {
    return (
      <div ref={ref} className={playerCanvasOuterBoxStyles}>
        <div className={playerCanvasBoxStyles}>
          <canvas />
          {children}
        </div>
      </div>
    );
  },
);
