interface BusEvents {
  currentTime: number;
  totalDuration: number;
}

type EventKey = keyof BusEvents;
type Listener<T> = (value: T) => void;

class VideoPlayerBus {
  private subscriptionsMap = new Map<
    EventKey,
    Listener<BusEvents[EventKey]>[]
  >();

  subscribe = (event: EventKey, listener: Listener<BusEvents[EventKey]>) => {
    const curListeners = this.subscriptionsMap.get(event) ?? [];
    curListeners.push(listener);
    this.subscriptionsMap.set(event, curListeners);

    return () => {
      this.unsubscribe(event, listener);
    };
  };

  dispatch = (event: EventKey, value: BusEvents[EventKey]) => {
    const listeners = this.subscriptionsMap.get(event);

    if (!listeners) {
      return;
    }

    listeners.forEach((fn) => fn(value));
  };

  private unsubscribe = (
    event: EventKey,
    listener: Listener<BusEvents[EventKey]>,
  ) => {
    const listeners = this.subscriptionsMap.get(event);

    if (!listeners) {
      return;
    }

    const nextListeners = listeners.filter((fn) => fn !== listener);

    if (nextListeners.length === 0) {
      this.subscriptionsMap.delete(event);
    } else {
      this.subscriptionsMap.set(event, nextListeners);
    }
  };
}

export const videoPlayerBus = new VideoPlayerBus();
