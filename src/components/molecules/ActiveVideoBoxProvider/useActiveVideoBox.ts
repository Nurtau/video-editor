import { useContext } from "react";

import { ActiveVideoBoxContext, type ActiveVideoBoxContextState } from "./ActiveVideoBoxContext";

export const useActiveVideoBox = (): ActiveVideoBoxContextState => {
  const value = useContext(ActiveVideoBoxContext);

  if (!value) {
    throw new Error("useActiveVideoBox must be used within ActiveVideoBoxProvider");
  }

  return value;
}
