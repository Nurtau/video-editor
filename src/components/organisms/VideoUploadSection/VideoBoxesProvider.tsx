import { useState, useMemo, useEffect, type ReactNode } from "react";

import { VideoBoxDemuxer } from "~/lib/VideoBoxDemuxer";

import {
  VideoBoxesContext,
  type VideoBoxesContextState,
} from "./VideoBoxesContext";
import { type VideoUploadBox } from "./VideoBoxItem";
import { storage } from "~/lib/Storage";

interface VideoBoxesProviderProps {
  children: ReactNode;
}

export const VideoBoxesProvider = ({ children }: VideoBoxesProviderProps) => {
  const [videoBoxes, setVideoBoxes] = useState<VideoUploadBox[]>([]);
  const [populated, setPopulated] = useState(false);

  useEffect(() => {
    const populateCachedBoxes = async () => {
      const rawBoxes = await storage.getVideoRawBoxes();

      try {
        const boxes = await Promise.all(
          rawBoxes.map(({ buffer, resourceId }) => {
            (buffer as any).fileStart = 0;
            return VideoBoxDemuxer.processBuffer(buffer, resourceId);
          }),
        );
        const cachedVideoBoxes = boxes.map((box, index) => {
          return { innerBox: box, name: rawBoxes[index].name };
        });

        setVideoBoxes(cachedVideoBoxes);
      } finally {
        setPopulated(true);
      }
    };

    const timerId = setTimeout(() => {
      populateCachedBoxes();
    }, 16);

    return () => {
      clearTimeout(timerId);
    };
  }, []);

  const contextState: VideoBoxesContextState = useMemo(
    () => ({
      videoBoxes,
      setVideoBoxes,
    }),
    [videoBoxes],
  );

  return (
    <VideoBoxesContext.Provider value={contextState}>
      {populated && children}
    </VideoBoxesContext.Provider>
  );
};
