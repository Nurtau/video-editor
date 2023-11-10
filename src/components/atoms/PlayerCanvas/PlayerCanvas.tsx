import { forwardRef } from "react";

import {
  playerCanvasOuterBoxStyles,
  playerCanvasBoxStyles,
} from "./PlayerCanvas.css";

export const PlayerCanvas = forwardRef<HTMLDivElement, {}>((_, ref) => {
  return (
    <div ref={ref} className={playerCanvasOuterBoxStyles}>
      <div className={playerCanvasBoxStyles}>
        <canvas />
      </div>
    </div>
  );
});
