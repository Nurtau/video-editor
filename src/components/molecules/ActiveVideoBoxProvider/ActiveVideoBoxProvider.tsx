import { useMemo, useState, type ReactNode } from "react";

import { type VideoBox } from "~/lib/VideoBox";
import {
  ActiveVideoBoxContext,
  type ActiveVideoBoxContextState,
} from "./ActiveVideoBoxContext";

interface ActiveVideoBoxProviderProps {
  children: ReactNode;
}

export const ActiveVideoBoxProvider = ({
  children,
}: ActiveVideoBoxProviderProps) => {
  const [activeVideoBox, setActiveVideoBox] = useState<VideoBox | null>(null);

  const value: ActiveVideoBoxContextState = useMemo(
    () => ({
      activeVideoBox,
      setActiveVideoBox,
    }),
    [activeVideoBox],
  );

  return (
    <ActiveVideoBoxContext.Provider value={value}>
      {children}
    </ActiveVideoBoxContext.Provider>
  );
};
