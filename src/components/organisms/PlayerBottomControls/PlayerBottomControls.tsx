import { useState, type ReactNode } from "react";

import { VideoTime } from "~/components/molecules";
import { IconButton } from "~/components/atoms";

interface PlayerBottomControlsProps {
  renderPlayerSlider(timeToPx: number): ReactNode;
}

export const PlayerBottomControls = ({
  renderPlayerSlider,
}: PlayerBottomControlsProps) => {
  const [timeToPx, setTimeToPx] = useState(128);

  const zoom = () => {
    setTimeToPx((prev) => prev * 2);
  };

  const unzoom = () => {
    setTimeToPx((prev) => prev / 2);
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "20%",
          borderBottom: "1.5px solid hsl(0, 0%, 40%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}></div>
        <div style={{ flex: 1 }}>
          <VideoTime />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
          }}
        >
          <IconButton name="plus" color="hsl(0, 0%, 60%)" onClick={zoom} />
          <IconButton name="minus" color="hsl(0, 0%, 60%)" onClick={unzoom} />
        </div>
      </div>
      <div
        style={{
          maxWidth: "100%",
          overflowX: "scroll",
          height: "80%",
          paddingLeft: "32px",
          paddingRight: "32px",
        }}
      >
        {renderPlayerSlider(timeToPx)}
      </div>
    </>
  );
};
