import { onUnmounted, ref } from "vue";

export type StreamStatus = "idle" | "connecting" | "open" | "error";

export interface StreamEvent {
  id: number;
  type: string;
  data: unknown;
}

export interface RawMessage {
  data: string;
  lastEventId: string;
}

interface EventSourceLike {
  addEventListener(type: string, listener: (e: RawMessage) => void): void;
  close(): void;
  onopen: ((this: unknown, ev: unknown) => unknown) | null;
  onerror: ((this: unknown, ev: unknown) => unknown) | null;
}

export type EventSourceFactory = (url: string, opts: { withCredentials: boolean }) => EventSourceLike;

const MAX_BACKOFF_MS = 30000;
const UNHEALTHY_AFTER_ERRORS = 3;

/**
 * Hand-rolled SSE client. Reconnects with exponential backoff, tracks the
 * last event id, and counts consecutive failures so callers can fall back
 * to polling. In-session resume across reconnects is handled by EventSource
 * itself via Last-Event-ID.
 */
export function useEventSource(createSource?: EventSourceFactory) {
  const status = ref<StreamStatus>("idle");
  const consecutiveErrors = ref(0);
  const unhealthy = ref(false);
  const lastEventId = ref(0);

  let source: EventSourceLike | null = null;
  let backoffMs = 1000;
  let reconnectTimer: number | undefined;
  let stopped = false;
  const handlers = new Map<string, Set<(event: StreamEvent) => void>>();

  function dispatch(type: string, raw: RawMessage): void {
    let data: unknown = null;
    try {
      data = JSON.parse(raw.data);
    } catch {
      data = raw.data;
    }
    const id = Number(raw.lastEventId);
    const event: StreamEvent = {
      id: Number.isFinite(id) ? id : 0,
      type,
      data,
    };
    if (event.id > lastEventId.value) lastEventId.value = event.id;
    for (const fn of handlers.get(type) ?? []) fn(event);
  }

  function attach(type: string): void {
    if (type === "*") return;
    source?.addEventListener(type, (raw) => dispatch(type, raw));
  }

  function on(type: string, fn: (event: StreamEvent) => void): () => void {
    let set = handlers.get(type);
    if (!set) {
      set = new Set();
      handlers.set(type, set);
      attach(type);
    }
    set.add(fn);
    return () => {
      set!.delete(fn);
    };
  }

  function scheduleReconnect(url: string): void {
    if (stopped) return;
    const delay = backoffMs + Math.floor(Math.random() * 500);
    backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
    window.clearTimeout(reconnectTimer);
    reconnectTimer = window.setTimeout(() => connect(url), delay);
  }

  function open(url: string): void {
    const factory: EventSourceFactory | undefined =
      createSource ??
      (typeof EventSource !== "undefined"
        ? (u, opts) => new EventSource(u, opts) as unknown as EventSourceLike
        : undefined);
    if (!factory) {
      consecutiveErrors.value += 1;
      unhealthy.value = true;
      status.value = "error";
      return;
    }

    source = factory(url, { withCredentials: true });
    source.onopen = () => {
      status.value = "open";
      consecutiveErrors.value = 0;
      unhealthy.value = false;
      backoffMs = 1000;
    };
    source.onerror = () => {
      status.value = "error";
      consecutiveErrors.value += 1;
      if (consecutiveErrors.value >= UNHEALTHY_AFTER_ERRORS) unhealthy.value = true;
      try {
        source?.close();
      } catch {
        // Ignore close errors; reconnect anyway.
      }
      source = null;
      scheduleReconnect(url);
    };
    for (const type of handlers.keys()) attach(type);
  }

  function connect(url: string): void {
    stopped = false;
    status.value = "connecting";
    window.clearTimeout(reconnectTimer);
    try {
      source?.close();
    } catch {
      // Already closed.
    }
    source = null;
    open(url);
  }

  function disconnect(): void {
    stopped = true;
    window.clearTimeout(reconnectTimer);
    try {
      source?.close();
    } catch {
      // Already closed.
    }
    source = null;
    status.value = "idle";
  }

  onUnmounted(() => {
    disconnect();
  });

  return { status, consecutiveErrors, unhealthy, lastEventId, on, connect, disconnect };
}
