import {
  sliderBoxStyles,
  headerBoxStyles,
  timelineBoxStyles,
} from "./PlayerSlider.css";

export const PlayerSlider = () => {
  return (
    <div className={sliderBoxStyles}>
      <div className={headerBoxStyles}></div>
      <div className={timelineBoxStyles}></div>
    </div>
  );
};
