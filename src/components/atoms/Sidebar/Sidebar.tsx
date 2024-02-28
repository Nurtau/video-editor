import { useState, type ReactNode } from "react";
import { type IconName } from "../Icon";
import { IconButton } from "../IconButton";

import {
  sidebarBoxStyles,
  iconListStyles,
  contextBoxStyles,
} from "./Sidebar.css";

interface SidebarItem {
  icon: IconName;
  value: string;
  content(): ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
}

export const Sidebar = ({ items }: SidebarProps) => {
  const [activeItem, setActiveItem] = useState(items[0]);

  return (
    <div className={sidebarBoxStyles}>
      <div className={iconListStyles}>
        {items.map((item) => (
          <IconButton
            key={item.value}
            name={item.icon}
            active={activeItem.value === item.value}
            iconColor="pale-gray"
            iconActiveColor="pale-blue"
            bgHoverColor="white5"
            iconSizing="lg"
            p="4"
            onClick={() => setActiveItem(item)}
          />
        ))}
      </div>
      <div className={contextBoxStyles}>{activeItem.content()}</div>
    </div>
  );
};
