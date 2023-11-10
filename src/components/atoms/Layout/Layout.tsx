import { type PropsWithChildren } from "react";

import {
  boxStyles,
  playerStyles,
  controlsStyles,
  trackStyles,
} from "./Layout.css";

const Box = ({ children }: PropsWithChildren) => {
  return <div className={boxStyles}>{children}</div>;
};

const Player = ({ children }: PropsWithChildren) => {
  return <div className={playerStyles}>{children}</div>;
};

const Track = ({ children }: PropsWithChildren) => {
  return <div className={trackStyles}>{children}</div>;
};

const Controls = ({ children }: PropsWithChildren) => {
  return <div className={controlsStyles}>{children}</div>;
};

export const Layout = {
  Box,
  Player,
  Controls,
  Track,
};
