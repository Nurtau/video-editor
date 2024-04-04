import { VideoHelpers } from "./VideoHelpers";

function sumWith<T>(array: T[], cb: (element: T) => number): number {
  return array.reduce((total, element) => total + cb(element), 0);
}

export class AudioRenderer {
  private audioContext: AudioContext | null = null;
  private volumeGainNode: GainNode | undefined;
  private muted: boolean = false;
  private volume: number = 1;
  private scheduledAudioSourceNodes: Array<{
    node: AudioBufferSourceNode;
    timestamp: number;
  }> = [];

  private prevTimeInMicros: number | null = null;
  private elapsedFromContext = 0;

  process(frames: AudioData[], currentTimeInMicros: number) {
    const firstFrame = frames[0];
    this.audioContext ??= this.initializeAudio(firstFrame.sampleRate);
    const firstTimestamp = firstFrame.timestamp;

    // Create an AudioBuffer containing all frame data
    const { numberOfChannels, sampleRate } = frames[0];
    const audioBuffer = new AudioBuffer({
      numberOfChannels,
      length: sumWith(frames, (frame) => frame.numberOfFrames),
      sampleRate,
    });
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const options: AudioDataCopyToOptions = {
        format: "f32-planar",
        planeIndex: channel,
      };
      const destination = audioBuffer.getChannelData(channel);
      let offset = 0;
      for (const frame of frames) {
        const size =
          frame.allocationSize(options) / Float32Array.BYTES_PER_ELEMENT;
        frame.copyTo(destination.subarray(offset, offset + size), options);
        offset += size;
      }
    }
    // Schedule an AudioBufferSourceNode to play the AudioBuffer
    this.scheduleAudioBuffer(audioBuffer, firstTimestamp, currentTimeInMicros);
  }

  reset() {
    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }
    this.scheduledAudioSourceNodes.forEach(({ node }) => {
      node.stop();
      node.disconnect();
    });
    this.scheduledAudioSourceNodes = [];
    this.volumeGainNode = undefined;
    this.prevTimeInMicros = null;
    this.elapsedFromContext = 0;
  }

  resume(): void {
    if (this.audioContext) {
      void this.audioContext.resume();
    }
  }

  suspend(): void {
    if (this.audioContext) {
      void this.audioContext.suspend();
    }
  }

  updateVolume(): void {
    if (this.volumeGainNode === undefined) return;
    this.volumeGainNode.gain.value = this.muted ? 0 : this.volume;
  }

  private initializeAudio(sampleRate: number): AudioContext {
    this.audioContext = new AudioContext({
      sampleRate: sampleRate,
      latencyHint: "playback",
    });

    this.volumeGainNode = new GainNode(this.audioContext);
    this.volumeGainNode.connect(this.audioContext.destination);
    this.updateVolume();

    return this.audioContext;
  }

  private scheduleAudioBuffer(
    audioBuffer: AudioBuffer,
    timestamp: number,
    currentTimeInMicros: number,
  ): void {
    const node = this.audioContext!.createBufferSource();
    node.buffer = audioBuffer;
    node.connect(this.volumeGainNode!);

    const entry = { node: node, timestamp };
    this.scheduledAudioSourceNodes.push(entry);
    node.addEventListener("ended", () => {
      node.disconnect();
      VideoHelpers.arrayRemove(this.scheduledAudioSourceNodes, entry);
    });

    const offset = (timestamp - currentTimeInMicros) / 1e6;
    node.playbackRate.value = 1;

    if (this.prevTimeInMicros === null) {
      this.elapsedFromContext = 0;
    } else {
      this.elapsedFromContext += currentTimeInMicros - this.prevTimeInMicros;
    }

    this.prevTimeInMicros = currentTimeInMicros;
    const currentTime = this.elapsedFromContext / 1e6;

    if (offset > 0) {
      node.start(currentTime + offset);
    } else {
      node.start(currentTime, -offset);
    }
  }
}
