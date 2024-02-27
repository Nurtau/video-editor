import * as Icons from "./react-icons";

export type IconName = keyof typeof Icons;

// @NOW: add props color, size
interface IconProps {
  name: IconName;
}

export const Icon = ({ name }: IconProps) => {
  const Component = Icons[name];

  return (
    <span>
      <Component />
    </span>
  );
};
