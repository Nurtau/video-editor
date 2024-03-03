import { useState } from "react";

import { Button, FileUploadButton, useFileReader } from "~/components/atoms";
import { VideoBoxDemuxer } from "~/lib/VideoBoxDemuxer";

import { VideoBoxItem, type ExtendedVideoBox } from "./VideoBoxItem";
import { useVideoBoxes } from "./VideoBoxesProvider";
import {
  uploadSectionBoxStyles,
  videosBoxStyles,
  controlsBoxStyles,
  videosListStyles,
  titleStyles,
} from "./VideoUploadSection.css";

export const VideoUploadSection = () => {
  const { videoBoxes, setVideoBoxes } = useVideoBoxes();
  const [selectedBox, setSelectedBox] = useState<ExtendedVideoBox | null>(null);

  const { readFile } = useFileReader({
    onOutput: async (name, data) => {
      const box = await VideoBoxDemuxer.processBuffer(data);
      setVideoBoxes([...videoBoxes, { ...box, name }]);
    },
  });

  const updateBoxFrame = (frame: VideoFrame, boxId: number) => {
    const nextVideoBoxes = videoBoxes.map((box) => {
      if (box.id !== boxId) return box;
      return {
        ...box,
        frame,
      };
    });
    setVideoBoxes(nextVideoBoxes);
  };

  return (
    <div className={uploadSectionBoxStyles}>
      <div className={videosBoxStyles}>
        <h3 className={titleStyles}>Uploaded videos</h3>
        <div className={videosListStyles}>
          {videoBoxes.map((box) => (
            <VideoBoxItem
              key={box.id}
              box={box}
              onSelect={() => setSelectedBox(box)}
              isChosen={selectedBox?.id === box.id}
              onFrame={(frame) => updateBoxFrame(frame, box.id)}
            />
          ))}
        </div>
      </div>
      <div className={controlsBoxStyles}>
        <FileUploadButton variant="primary" onUpload={readFile}>
          Upload
        </FileUploadButton>
        <Button
          variant="secondary"
          onClick={() => console.log(selectedBox)}
          disabled={selectedBox === null}
        >
          Move to timeline
        </Button>
      </div>
    </div>
  );
};
