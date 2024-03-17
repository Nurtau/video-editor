import {
  createFile,
  type MP4File,
  type MP4Info,
  type MP4ArrayBuffer,
  type MP4Sample,
} from "mp4box";

import { VideoFrameDecoder } from "./VideoFrameDecoder";
import { VideoTrackBuffer } from "./VideoTrackBuffer";
import { generateId } from "./helpers";

const extractSamples = (mp4File: MP4File, trackId: number) => {
  return new Promise<MP4Sample[]>((resolve) => {
    mp4File.onSamples = (_, __, samples) => {
      resolve(samples);
    };
    mp4File.setExtractionOptions(trackId, null, {
      nbSamples: Infinity,
    });
    mp4File.start();
  });
};

export interface VideoBox {
  id: number;
  videoTrackBuffers: VideoTrackBuffer[];
}

const processBuffer = async (buffer: ArrayBuffer): Promise<VideoBox> => {
  const mp4File = createFile();

  const infoPromise = new Promise<MP4Info>((resolve) => {
    mp4File.onReady = resolve;
  });

  mp4File.appendBuffer(buffer as MP4ArrayBuffer);
  mp4File.flush();

  const info = await infoPromise;
  const videoTrackBuffers: VideoTrackBuffer[] = [];

  for (const track of info.videoTracks) {
    const samples = await extractSamples(mp4File, track.id);
    const trak = mp4File.getTrackById(track.id);
    const codecConfig = VideoFrameDecoder.buildConfig(track, trak);
    const trackBuffer = new VideoTrackBuffer({
      samples,
      videoDecoderConfig: codecConfig,
    });
    videoTrackBuffers.push(trackBuffer);
  }

  // @TODO: handle audio tracks

  return {
    videoTrackBuffers,
    id: generateId(),
  };
};

export const VideoBoxDemuxer = {
  processBuffer,
};
