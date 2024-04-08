import { useState } from "react";

import { Button, FileUploadButton, useFileReader } from "~/components/atoms";
import { VideoBoxDemuxer } from "~/lib/VideoBoxDemuxer";
import { VideoBox } from "~/lib/VideoBox";

import { VideoBoxItem, type VideoUploadBox } from "./VideoBoxItem";
import { useVideoBoxes } from "./useVideoBoxes";
import {
  uploadSectionBoxStyles,
  videosBoxStyles,
  controlsBoxStyles,
  videosListStyles,
  titleStyles,
  boxBorderStyles,
  contentLabelStyles,
} from "./VideoUploadSection.css";

interface VideoUploadSectionProps {
  onMoveToTimeline(videoBox: VideoBox): void;
}

export const VideoUploadSection = ({
  onMoveToTimeline,
}: VideoUploadSectionProps) => {
  const { videoBoxes, setVideoBoxes } = useVideoBoxes();
  const [selectedBox, setSelectedBox] = useState<VideoUploadBox | null>(null);

  const { readFile } = useFileReader({
    onOutput: async (name, data) => {
      const box = await VideoBoxDemuxer.processBuffer(data);
      setVideoBoxes([...videoBoxes, { innerBox: box, name }]);
    },
  });

  const updateBoxFrame = (frame: VideoFrame, boxId: number) => {
    const nextVideoBoxes = videoBoxes.map((box) => {
      if (box.innerBox.id !== boxId) return box;
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
        {videoBoxes.length === 0 ? (
          <div className={boxBorderStyles}>
            <div className={contentLabelStyles}>
              To proceed with editing, please upload the video first
            </div>
          </div>
        ) : (
          <div className={videosListStyles}>
            {videoBoxes.map((box) => (
              <VideoBoxItem
                key={box.innerBox.id}
                item={box}
                onSelect={() => setSelectedBox(box)}
                isChosen={selectedBox?.innerBox.id === box.innerBox.id}
                onFrame={(frame) => updateBoxFrame(frame, box.innerBox.id)}
              />
            ))}
          </div>
        )}
      </div>
      <div className={controlsBoxStyles}>
        <FileUploadButton variant="primary" onUpload={readFile}>
          Upload
        </FileUploadButton>
        <Button
          variant="secondary"
          onClick={() => {
            if (selectedBox) {
              onMoveToTimeline(selectedBox.innerBox);
            }
          }}
          disabled={selectedBox === null}
        >
          Move to timeline
        </Button>
      </div>
    </div>
  );
};
