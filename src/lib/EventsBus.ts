interface BusEvents {
  currentTime: number;
  totalDuration: number;
  modifiedVideoTrackId: number;
  deletedVideoTrackId: number;
  splittedVideoTrack: {
    id: number;
    atTime: number;
  };
}

type EventKey = keyof BusEvents;
type Listener<T> = (value: T) => void;

class EventsBus {
  private eventListeners: {
    [Key in EventKey]: Listener<BusEvents[Key]>[];
  } = {
    currentTime: [],
    totalDuration: [],
    modifiedVideoTrackId: [],
    deletedVideoTrackId: [],
    splittedVideoTrack: [],
  };

  subscribe = <T extends EventKey>(
    event: T,
    listener: Listener<BusEvents[T]>,
  ) => {
    const curListeners = this.eventListeners[event];
    curListeners.push(listener);

    return () => {
      this.unsubscribe(event, listener);
    };
  };

  dispatch = <T extends EventKey>(event: T, value: BusEvents[T]) => {
    const listeners = this.eventListeners[event];
    listeners.forEach((fn) => fn(value));
  };

  private unsubscribe = <T extends EventKey>(
    event: T,
    listener: Listener<BusEvents[T]>,
  ) => {
    const listeners = this.eventListeners[event];
    const nextListeners = listeners.filter((fn) => fn !== listener);
    this.eventListeners[event] = nextListeners as any;
  };
}

export const eventsBus = new EventsBus();
