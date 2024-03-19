import {
  sliderBoxStyles,
  headerBoxStyles,
  titleStyles,
  valueTextStyles,
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
  return (
    <div className={sliderBoxStyles}>
      <div className={headerBoxStyles}>
        <div className={titleStyles}>{title}</div>
        <div className={valueTextStyles}>
          {getValueText ? getValueText(value) : value}
        </div>
      </div>
      <input
        value={value}
        max={max}
        min={min}
        step={1}
        type="range"
        onInput={(event) =>
          onChange((event.target as HTMLInputElement).valueAsNumber)
        }
      />
    </div>
  );
};
