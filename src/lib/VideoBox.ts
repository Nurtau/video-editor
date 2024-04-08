import { VideoTrackBuffer } from "./VideoTrackBuffer";
import { AudioTrackBuffer } from "./AudioTrackBuffer";
import { generateId } from "./helpers";

export interface VideoBoxEffects {
  blur: number;
  opacity: number;
  brigthness: number;
  saturation: number;
  hue: number;
}

// in seconds
interface VideoBoxRange {
  start: number;
  end: number;
  maxEnd: number;
}

interface VideoBoxProps {
  videoTrackBuffers: VideoTrackBuffer[];
  audioTrackBuffers: AudioTrackBuffer[];
}

// @NOW: prefix timestamp should added to each chunk, but due to reference check: there is no easy way

export class VideoBox {
  public id = generateId();

  private videoTrackBuffers: VideoTrackBuffer[];
  private audioTrackBuffers: AudioTrackBuffer[];
  private range: VideoBoxRange;
  private effects: VideoBoxEffects;

  static getDefaultEffects(): VideoBoxEffects {
    return {
      blur: 0,
      opacity: 100,
      brigthness: 0,
      saturation: 0,
      hue: 0,
    };
  }

  constructor(props: VideoBoxProps | VideoBox) {
    if (props instanceof VideoBox) {
      this.videoTrackBuffers = props.getVideoTrackBuffers();
      this.audioTrackBuffers = props.getAudioTrackBuffers();
      this.range = props.getRange();
      this.effects = props.getEffects();
    } else {
      this.videoTrackBuffers = props.videoTrackBuffers;
      this.audioTrackBuffers = props.audioTrackBuffers;
      this.effects = VideoBox.getDefaultEffects();

      const maxDuration = props.videoTrackBuffers.reduce(
        (acc, track) => acc + track.getDurationInS(),
        0,
      );

      this.range = {
        start: 0,
        end: maxDuration,
        maxEnd: maxDuration,
      };
    }
  }

  copy = (): VideoBox => {
    return new VideoBox(this);
  };

  splitAt(timeInS: number): [VideoBox, VideoBox] {
    const relativeTime = timeInS + this.range.start;

    const leftCopy = this.copy();
    const rightCopy = this.copy();

    leftCopy.updateRange({
      end: relativeTime,
    });

    rightCopy.updateRange({
      start: relativeTime,
    });

    return [leftCopy, rightCopy];
  }

  getVideoChunksDependencies = (timeInS: number) => {
    const timeInMicros = Math.floor((this.range.start + timeInS) * 1e6);

    if (timeInMicros > this.range.end * 1e6) return null;

    let prefixTsInMicros = 0;

    const containingTrack = this.videoTrackBuffers.find((track) => {
      const trackDurationInMicros = track.getDurationInS() * 1e6;

      if (timeInMicros < prefixTsInMicros + trackDurationInMicros) {
        return true;
      } else {
        prefixTsInMicros += trackDurationInMicros;
        return false;
      }
    });

    if (!containingTrack) return null;

    const deps = containingTrack.getVideoChunksDependencies(
      (timeInMicros - prefixTsInMicros) / 1e6,
    );

    if (!deps) return null;

    return {
      codecConfig: containingTrack.getCodecConfig(),
      chunks: deps,
    };
  };

  getNextVideoChunks = (videoChunk: EncodedVideoChunk, maxAmount: number) => {
    const containingTrack = this.videoTrackBuffers.find((track) => {
      return track
        .getVideoChunksGroups()
        .some((group) => group.videoChunks.includes(videoChunk));
    });

    if (!containingTrack) return null;

    const containingTrackIndex =
      this.videoTrackBuffers.indexOf(containingTrack);

    /*
    const prefixTsInS = this.videoTrackBuffers
      .slice(0, containingTrackIndex)
      .reduce((acc, track) => acc + track.getDurationInS(), 0);
    */

    let nextVideoChunks = containingTrack.getNextVideoChunks(
      videoChunk,
      maxAmount,
      this.range.end,
    );

    let codecConfig = containingTrack.getCodecConfig();

    if (
      !nextVideoChunks &&
      containingTrackIndex + 1 < this.videoTrackBuffers.length
    ) {
      const nextTrack = this.videoTrackBuffers[containingTrackIndex + 1];

      nextVideoChunks = nextTrack.getVideoChunksDependencies(0);
      codecConfig = nextTrack.getCodecConfig();
    }

    if (!nextVideoChunks) return null;

    return {
      codecConfig,
      chunks: nextVideoChunks,
    };
  };

  getAudioChunksDependencies = (timeInS: number) => {
    const timeInMicros = Math.floor((this.range.start + timeInS) * 1e6);

    if (timeInMicros > this.range.end * 1e6) return null;

    let prefixTsInMicros = 0;

    const containingTrack = this.audioTrackBuffers.find((track) => {
      const trackDurationInMicros = track.getDurationInS() * 1e6;

      if (timeInMicros < prefixTsInMicros + trackDurationInMicros) {
        return true;
      } else {
        prefixTsInMicros += trackDurationInMicros;
        return false;
      }
    });

    if (!containingTrack) return null;

    const deps = containingTrack.getAudioChunksDependencies(
      (timeInMicros - prefixTsInMicros) / 1e6,
    );

    if (!deps) return null;

    return {
      codecConfig: containingTrack.getCodecConfig(),
      chunks: deps,
    };
  };

  getNextAudioChunks = (audioChunk: EncodedAudioChunk, maxAmount: number) => {
    const containingTrack = this.audioTrackBuffers.find((track) => {
      return track.hasFrame(audioChunk);
    });

    if (!containingTrack) return null;

    const containingTrackIndex =
      this.audioTrackBuffers.indexOf(containingTrack);

    /*
    const prefixTsInS = this.videoTrackBuffers
      .slice(0, containingTrackIndex)
      .reduce((acc, track) => acc + track.getDurationInS(), 0);
    */

    let nextAudioChunks = containingTrack.getNextAudioChunks(
      audioChunk,
      maxAmount,
      this.range.end,
    );

    let codecConfig = containingTrack.getCodecConfig();

    if (
      !nextAudioChunks &&
      containingTrackIndex + 1 < this.audioTrackBuffers.length
    ) {
      const nextTrack = this.audioTrackBuffers[containingTrackIndex + 1];
      nextAudioChunks = nextTrack.getAudioChunksDependencies(0);
      codecConfig = nextTrack.getCodecConfig();
    }

    if (!nextAudioChunks) return null;

    return {
      codecConfig,
      chunks: nextAudioChunks,
    };
  };

  getVideoTrackBuffers = () => {
    return this.videoTrackBuffers;
  };

  getAudioTrackBuffers = () => {
    return this.audioTrackBuffers;
  };

  getDurationInS = () => {
    return this.range.end - this.range.start;
  };

  getEffects = () => {
    return this.effects;
  };

  getRange = () => {
    return this.range;
  };

  updateRange = (rangeChanges: Partial<VideoBoxRange>) => {
    this.range = { ...this.range, ...rangeChanges };
  };

  updateEffects = (newEffects: Partial<VideoBoxEffects>) => {
    this.effects = { ...this.effects, ...newEffects };
  };

  resetEffects = () => {
    this.effects = VideoBox.getDefaultEffects();
  };
}
