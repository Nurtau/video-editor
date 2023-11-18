export class VideoTrackDecoder {
    private decoder: VideoDecoder;
    private lastConfig: VideoDecoderConfig | null = null;
    private stashedVideoFrames: VideoFrame[] = [];

    constructor() {
        this.decoder = new VideoDecoder({
            output: (frame) => {
                this.stashedVideoFrames.push(frame);
            },
            error: console.log,
        });
    }

    async decode(videoChunks: EncodedVideoChunk[], codecConfig: VideoDecoderConfig) {
        this.stashedVideoFrames = [];

        if (
            this.decoder.state === "unconfigured" ||
            this.lastConfig !== codecConfig
        ) {
            this.decoder.configure(codecConfig);
            this.lastConfig = codecConfig;
        }

        videoChunks.forEach(chunk => this.decoder.decode(chunk));
        await this.decoder.flush();
        return this.stashedVideoFrames;
    }

    reset = () => {
      this.decoder.reset();
    }
}
