// Inspired by https://github.com/ai/nanoevents with which my jest was struggling

export interface EventDictionary {
  [event: string]: any
}

type EventCallbackMap<Events extends EventDictionary> = {
  [E in keyof Events]: Events[E][]
}

export interface Unsubscribe {
  (): void
}

export class Emitter<Events extends EventDictionary> {
  events: Partial<EventCallbackMap<Events>> = {};

  emit<K extends keyof Events>(this: this, event: K, ...args: Parameters<Events[K]>): void {
    const listeners: Events[K][] | undefined = this.events[event];
    if (listeners !== undefined) {
      for (const listener of listeners) {
        listener(...args);
      }
    }
  }

  on<K extends keyof Events>(this: this, event: K, cb: Events[K]): Unsubscribe {
    let listeners: Events[K][] | undefined = this.events[event];
    if (listeners === undefined) {
      listeners = [];
    }
    listeners.push(cb);
    this.events[event] = listeners;

    return () => {
      listeners = this.events[event];
      if (listeners !== undefined) {
        listeners = listeners.filter(c => c !== cb);
        this.events[event] = listeners;
      }
    }
  }
}