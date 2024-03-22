import { type ReactNode } from "react";
import { type IconName } from "../Icon";
import { IconButton } from "../IconButton";

import {
  sidebarBoxStyles,
  iconListStyles,
  contextBoxStyles,
} from "./Sidebar.css";

interface SidebarItem<T extends string> {
  icon: IconName;
  key: T;
  content(): ReactNode;
}

interface SidebarProps<T extends string> {
  activeKey: T;
  setActiveKey(value: T): void;
  items: SidebarItem<T>[];
}

export const Sidebar = <T extends string>({
  activeKey,
  setActiveKey,
  items,
}: SidebarProps<T>) => {
  const activeItem = items.find((item) => item.key === activeKey);

  return (
    <div className={sidebarBoxStyles}>
      <div className={iconListStyles}>
        {items.map((item) => (
          <IconButton
            key={item.key}
            name={item.icon}
            active={activeKey === item.key}
            iconColor="pale-gray"
            iconActiveColor="pale-blue"
            bgHoverColor="white5"
            iconSizing="lg"
            p="4"
            onClick={() => setActiveKey(item.key)}
          />
        ))}
      </div>
      <div className={contextBoxStyles}>{activeItem?.content()}</div>
    </div>
  );
};
