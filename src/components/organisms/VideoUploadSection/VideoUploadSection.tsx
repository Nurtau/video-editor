import { useState } from "react";

import { Button, FileUploadButton, useFileReader } from "~/components/atoms";
import { VideoBoxDemuxer } from "~/lib/VideoBoxDemuxer";

import { VideoBoxItem, type ExtendedVideoBox } from "./VideoBoxItem";
import {
  uploadSectionBoxStyles,
  videosBoxStyles,
  controlsBoxStyles,
  videosListStyles,
  titleStyles,
} from "./VideoUploadSection.css";

export const VideoUploadSection = () => {
  const [selectedBox, setSelectedBox] = useState<ExtendedVideoBox | null>(null);
  const [videoBoxes, setVideoBoxes] = useState<ExtendedVideoBox[]>([]);

  const { readFile } = useFileReader({
    onOutput: async (name, data) => {
      const box = await VideoBoxDemuxer.processBuffer(data);
      setVideoBoxes((curBoxes) => [...curBoxes, { ...box, name }]);
    },
  });

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
