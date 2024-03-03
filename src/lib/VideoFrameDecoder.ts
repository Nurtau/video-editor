import { DataStream, type MP4VideoTrack, type Trak } from "mp4box";

interface VideoFrameDecoderProps {
  onDecode(frame: VideoFrame): void;
}

export class VideoFrameDecoder {
  private decoder: VideoDecoder;
  private lastConfig: VideoDecoderConfig | null = null;

  static buildConfig(track: MP4VideoTrack, trak: Trak): VideoDecoderConfig {
    let description;
    for (const entry of trak?.mdia?.minf?.stbl?.stsd?.entries ?? []) {
      if (entry.avcC || entry.hvcC) {
        const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
        if (entry.avcC) {
          entry.avcC.write(stream);
        } else {
          entry.hvcC?.write(stream);
        }
        description = new Uint8Array(stream.buffer, 8);
        break;
      }
    }

    return {
      codec: track.codec,
      codedHeight: track.track_height,
      codedWidth: track.track_width,
      hardwareAcceleration: "prefer-hardware",
      description,
    };
  }

  constructor({ onDecode }: VideoFrameDecoderProps) {
    this.decoder = new VideoDecoder({
      output: onDecode,
      error: console.log,
    });
  }

  decode = (videoChunk: EncodedVideoChunk, codecConfig: VideoDecoderConfig) => {
    if (
      this.decoder.state === "unconfigured" ||
      this.lastConfig !== codecConfig
    ) {
      this.decoder.configure(codecConfig);
      this.lastConfig = codecConfig;
    }

    this.decoder.decode(videoChunk);
  };

  flush = () => {
    this.decoder.flush();
  };

  reset = () => {
    this.decoder.reset();
  };
}
