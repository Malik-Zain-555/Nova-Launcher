type EventHandler<T = any> = (payload: T) => void;

export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, Set<EventHandler>> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return () => {
      this.off(event, handler);
    };
  }

  public off<T = any>(event: string, handler: EventHandler<T>): void {
    const set = this.handlers.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) {
        this.handlers.delete(event);
      }
    }
  }

  public emit<T = any>(event: string, payload?: T): void {
    const set = this.handlers.get(event);
    if (set) {
      set.forEach(handler => {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[EventBus] Error in handler for event "${event}":`, err);
        }
      });
    }

    // Forward to Electron main process if available
    if (typeof window !== 'undefined' && (window as any).novaAPI?.emitNativeEvent) {
      (window as any).novaAPI.emitNativeEvent(event, payload);
    }
  }
}
