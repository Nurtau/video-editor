import { useLayoutEffect, useRef } from "react";

import {
  sliderBoxStyles,
  headerBoxStyles,
  titleStyles,
  valueTextStyles,
  sliderStyles,
} from "./Slider.css";

interface SliderProps {
  value: number;
  onChange(value: number): void;
  max: number;
  min: number;
  title: string;
  getValueText?(value: number): string;
}

export const Slider = ({
  value,
  onChange,
  max,
  min,
  title,
  getValueText,
}: SliderProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useLayoutEffect(() => {
    if (!inputRef.current) return;

    const maxDistance = max - min;
    const curDistance = value - min;
    const distancePercentage = Math.round((curDistance / maxDistance) * 100);

    inputRef.current.style.backgroundSize = `${distancePercentage}% 100%`;
  }, [value, max, min]);

  return (
    <div className={sliderBoxStyles}>
      <div className={headerBoxStyles}>
        <div className={titleStyles}>{title}</div>
        <div className={valueTextStyles}>
          {getValueText ? getValueText(value) : value}
        </div>
      </div>
      <input
        ref={inputRef}
        value={value}
        max={max}
        min={min}
        step={1}
        type="range"
        className={sliderStyles}
        onInput={(event) =>
          onChange((event.target as HTMLInputElement).valueAsNumber)
        }
      />
    </div>
  );
};
