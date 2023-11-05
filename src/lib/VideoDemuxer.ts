import {
  createFile,
  type MP4File,
  type MP4Info,
  type MP4ArrayBuffer,
  type MP4Sample,
} from "mp4box";

const buildPromise = <T>() => {
  let resolve;

  const promise = new Promise<T>((r) => (resolve = r));

  return { resolve: resolve as unknown as (val: T) => void, promise };
};

export class VideoDemuxer {
  private mp4File: MP4File;
  private onReady = buildPromise<MP4Info>();
  private onSamples = buildPromise<MP4Sample[]>();

  constructor(buffer: MP4ArrayBuffer) {
    this.mp4File = createFile();

    this.mp4File.onReady = (info) => {
      const track = info.videoTracks[0];
      // @TODO: what about partioning Infinity
      this.mp4File.setExtractionOptions(track.id, null, {
        nbSamples: Infinity,
      });
      this.mp4File.start();
      this.onReady.resolve(info);
    };

    this.mp4File.onSamples = (_, __, samples) => {
      this.onSamples.resolve(samples);
    };

    this.mp4File.appendBuffer(buffer);
    this.mp4File.flush();
  }

  getInfo() {
    return this.onReady.promise;
  }

  getSamples() {
    return this.onSamples.promise;
  }

  getFile() {
    return this.mp4File;
  }
}
