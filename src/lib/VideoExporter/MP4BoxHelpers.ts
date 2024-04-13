import { ISOFile, BoxParser, MP4BoxStream } from "mp4box";

export const VIDEO_TIMESCALE = 90000;
export const AUDIO_TIMESCALE = 48000;

export function addSample(
  mp4File: typeof ISOFile,
  trak: any,
  data: Uint8Array,
  isSync: boolean,
  duration: number,
  addDuration: boolean,
  chunkOffset: number,
  isFirstSample: boolean = false,
) {
  const isVideo = trak.mdia.hdlr.handler === "vide";

  if (isFirstSample && isVideo) {
    const headerSize =
      (((4 + data[0]) << (24 + data[1])) << (16 + data[2])) << (8 + data[3]);
    data = data.slice(headerSize);
  }

  mp4File.mdat.parts.push(data);

  const scaledDuration =
    (duration / (isVideo ? VIDEO_TIMESCALE : AUDIO_TIMESCALE)) * 1000;
  trak.samples_duration += scaledDuration;
  trak.tkhd.duration += scaledDuration;
  trak.mdia.mdhd.duration += duration;
  if (addDuration) {
    mp4File.moov.mvhd.duration += scaledDuration;
  }

  const stbl = trak.mdia.minf.stbl;
  const index = stbl.stts.sample_deltas.length - 1;

  if (stbl.stts.sample_deltas[index] !== duration) {
    stbl.stts.sample_deltas.push(duration);
    stbl.stts.sample_counts.push(1);
  } else {
    stbl.stts.sample_counts[index]++;
  }

  if (isVideo && isSync) {
    stbl.stss.sample_numbers.push(
      stbl.stts.sample_counts.reduce((a: number, b: number) => a + b),
    );
  }

  stbl.stco.chunk_offsets.push(chunkOffset);
  stbl.stsz.sample_sizes.push(data.byteLength);

  stbl.stsz.sample_count++;

  return chunkOffset + data.byteLength;
}

export function addTrak(mp4File: typeof ISOFile, config: any) {
  const isVideo = config.type === "video";
  const moov = mp4File.moov;
  const trak = moov.add("trak");

  const id = moov.mvhd.next_track_id;
  moov.mvhd.next_track_id++;

  trak
    .add("tkhd")
    .set(
      "flags",
      BoxParser.TKHD_FLAG_ENABLED |
        BoxParser.TKHD_FLAG_IN_MOVIE |
        BoxParser.TKHD_FLAG_IN_PREVIEW,
    )
    .set("creation_time", 0)
    .set("modification_time", 0)
    .set("track_id", id)
    .set("duration", 0)
    .set("layer", 0)
    .set("alternate_group", 0)
    .set("volume", 1)
    .set("matrix", [1 << 16, 0, 0, 0, 1 << 16, 0, 0, 0, 0x40000000])
    .set("width", (config.width || 0) << 16)
    .set("height", (config.height || 0) << 16);

  const mdia = trak.add("mdia");

  mdia
    .add("mdhd")
    .set("creation_time", 0)
    .set("modification_time", 0)
    .set("timescale", isVideo ? VIDEO_TIMESCALE : AUDIO_TIMESCALE)
    .set("duration", 0)
    .set("language", 21956)
    .set("languageString", "und");

  mdia
    .add("hdlr")
    .set("handler", isVideo ? "vide" : "soun")
    .set("name", "");

  const minf = mdia.add("minf");

  if (isVideo) {
    minf.add("vmhd").set("graphicsmode", 0).set("opcolor", [0, 0, 0]);
  } else {
    minf.add("smhd").set("flags", 1).set("balance", 0);
  }

  const dinf = minf.add("dinf");
  const url = new BoxParser["url Box"]().set("flags", 0x1);
  dinf.add("dref").addEntry(url);

  const stbl = minf.add("stbl");

  if (isVideo) {
    const sample_description_entry = new BoxParser.avc1SampleEntry();
    sample_description_entry.data_reference_index = 1;
    sample_description_entry
      .set("width", config.width || 0)
      .set("height", config.height || 0)
      .set("horizresolution", 0x48 << 16)
      .set("vertresolution", 0x48 << 16)
      .set("frame_count", 1)
      .set("compressorname", "")
      .set("depth", 0x18);

    const avcC = new BoxParser.avcCBox();
    const stream = new MP4BoxStream(config.avcDecoderConfigRecord);
    avcC.parse(stream);
    sample_description_entry.addBox(avcC);

    stbl.add("stsd").addEntry(sample_description_entry);
  } else {
    stbl.add("stsd").addEntry(config.mp4a);
  }

  stbl.add("stts").set("sample_counts", []).set("sample_deltas", []);

  if (isVideo) {
    stbl.add("stss").set("sample_numbers", []);
  }

  stbl
    .add("stsc")
    .set("first_chunk", [1])
    .set("samples_per_chunk", [1])
    .set("sample_description_index", [1]);

  stbl.add("stsz").set("sample_sizes", []);
  stbl.add("stco").set("chunk_offsets", []);

  return trak;
}

export function createMP4File() {
  const mp4File = new ISOFile();

  mp4File
    .add("ftyp")
    .set("major_brand", "mp42")
    .set("minor_version", 0)
    .set("compatible_brands", ["mp42", "isom"]);

  mp4File.add("free");

  const mdat = mp4File.add("mdat");
  mp4File.mdat = mdat;
  mdat.parts = [];
  mdat.write = function (stream: any) {
    this.size = this.parts
      .map((part: any) => part.byteLength)
      .reduce((a: number, b: number) => a + b, 0);
    this.writeHeader(stream);
    this.parts.forEach((part: any) => {
      stream.writeUint8Array(part);
    });
  };

  const moov = mp4File.add("moov");

  moov
    .add("mvhd")
    .set("timescale", 1000)
    .set("rate", 1 << 16)
    .set("creation_time", 0)
    .set("modification_time", 0)
    .set("duration", 0)
    .set("volume", 1)
    .set("matrix", [
      1 << 16,
      0,
      0, //
      0,
      1 << 16,
      0, //
      0,
      0,
      0x40000000,
    ])
    .set("next_track_id", 1);

  return mp4File;
}
