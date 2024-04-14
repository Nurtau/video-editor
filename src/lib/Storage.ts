import type { Settings } from "~/types";

import type { SerializableVideoBox } from "./VideoBox";

const VIDEO_RAW_BUFFER_BOXES_KEY = "videoRawBoxes";
const VIDEO_TIMELINE_BOXES_KEY = "videoTimelineBoxes";
const VIDEO_SETTINGS_KEY = "videoSettings";

interface VideoRawBufferBox {
  buffer: ArrayBuffer;
  name: string;
  resourceId: string;
}

class Storage {
  private db: IDBDatabase | null = null;
  private promise: Promise<void>;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open("video-editor", 1);
      request.onerror = reject;

      request.onsuccess = (event: any) => {
        this.db = event.target.result as IDBDatabase;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        this.db = event.target.result as IDBDatabase;
        this.db.createObjectStore(VIDEO_RAW_BUFFER_BOXES_KEY, {
          keyPath: "resourceId",
        });
      };
    });
  }

  addVideoRawBox = async (rawBox: VideoRawBufferBox) => {
    await this.promise;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [VIDEO_RAW_BUFFER_BOXES_KEY],
        "readwrite",
      );
      const objectStore = transaction.objectStore(VIDEO_RAW_BUFFER_BOXES_KEY);
      const request = objectStore.add(rawBox);

      request.onerror = reject;
      request.onsuccess = resolve;
    });
  };

  getVideoRawBoxes = async () => {
    await this.promise;

    const transaction = this.db!.transaction(
      [VIDEO_RAW_BUFFER_BOXES_KEY],
      "readonly",
    );
    const objectStore = transaction.objectStore(VIDEO_RAW_BUFFER_BOXES_KEY);
    const request = objectStore.getAll();

    return new Promise<VideoRawBufferBox[]>((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = reject;
    });
  };

  saveTimelineVideoBoxesMetadata = (timelineBoxes: SerializableVideoBox[]) => {
    window.localStorage.setItem(
      VIDEO_TIMELINE_BOXES_KEY,
      JSON.stringify(timelineBoxes),
    );
  };

  getTimelineVideoBoxesMetadata = (): SerializableVideoBox[] => {
    const rawValue = window.localStorage.getItem(VIDEO_TIMELINE_BOXES_KEY);

    if (!rawValue) return [];
    return JSON.parse(rawValue);
  };

  saveSettings = (settings: Settings) => {
    window.localStorage.setItem(VIDEO_SETTINGS_KEY, JSON.stringify(settings));
  };

  getSettings = (): Settings | null => {
    const rawValue = window.localStorage.getItem(VIDEO_SETTINGS_KEY);

    if (!rawValue) return null;
    return JSON.parse(rawValue);
  };
}

export const storage = new Storage();
