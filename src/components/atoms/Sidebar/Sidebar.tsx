import { ReactNode } from "react";
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
  value: string;
  items: SidebarItem[];
}

export const Sidebar = ({ value, items }: SidebarProps) => {
  return (
    <div className={sidebarBoxStyles}>
      <div className={iconListStyles}>
        <IconButton name="Sliders" onClick={() => {}} />
      </div>
      <div className={contextBoxStyles}></div>
    </div>
  );
};
