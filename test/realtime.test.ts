import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEventSource, type RawMessage } from "@/composables/useEventSource";
import { __clearRealtimeListeners, dispatchRealtimeEvent, onRealtimeEvent, refreshTick } from "@/composables/useRealtime";

type Listener = (e: RawMessage) => void;

class FakeSource {
  listeners = new Map<string, Listener[]>();
  onopen: ((this: unknown, ev: unknown) => unknown) | null = null;
  onerror: ((this: unknown, ev: unknown) => unknown) | null = null;
  closed = false;

  addEventListener(type: string, listener: Listener): void {
    const list = this.listeners.get(type) ?? [];
    list.push(listener);
    this.listeners.set(type, list);
  }

  close(): void {
    this.closed = true;
  }

  open(): void {
    this.onopen?.call(this, {});
  }

  fail(): void {
    this.onerror?.call(this, new Error("down"));
  }

  emit(type: string, id: number, data: unknown): void {
    for (const fn of this.listeners.get(type) ?? []) {
      fn({ data: JSON.stringify(data), lastEventId: String(id) });
    }
  }
}

describe("useEventSource", () => {
  let sources: FakeSource[];

  beforeEach(() => {
    vi.useFakeTimers();
    sources = [];
    __clearRealtimeListeners();
  });

  afterEach(() => {
    vi.useRealTimers();
    __clearRealtimeListeners();
  });

  function factory(): FakeSource {
    const s = new FakeSource();
    sources.push(s);
    return s;
  }

  it("dispatches typed events and tracks the last id", () => {
    const stream = useEventSource((url, opts) => {
      expect(opts.withCredentials).toBe(true);
      return factory();
    });
    const seen: string[] = [];
    stream.on("task:created", (e) => seen.push((e.data as { title: string }).title));

    stream.connect("http://x/events");
    sources[0]!.open();
    expect(stream.status.value).toBe("open");

    sources[0]!.emit("task:created", 7, { title: "Hello" });
    expect(seen).toEqual(["Hello"]);
    expect(stream.lastEventId.value).toBe(7);
    stream.disconnect();
  });

  it("reconnects with backoff and marks unhealthy after repeated errors", async () => {
    const stream = useEventSource(() => factory());
    stream.connect("http://x/events");
    sources[0]!.open();

    sources[0]!.fail();
    expect(stream.status.value).toBe("error");
    expect(stream.unhealthy.value).toBe(false);
    expect(sources).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(2000);
    expect(sources).toHaveLength(2);
    sources[1]!.fail();
    await vi.advanceTimersByTimeAsync(5000);
    expect(sources).toHaveLength(3);
    sources[2]!.fail();

    expect(stream.unhealthy.value).toBe(true);
    expect(stream.consecutiveErrors.value).toBe(3);
    stream.disconnect();
  });

  it("resets backoff after a successful open", async () => {
    const stream = useEventSource(() => factory());
    stream.connect("http://x/events");
    sources[0]!.fail();
    await vi.advanceTimersByTimeAsync(2000);
    sources[1]!.open();
    expect(stream.consecutiveErrors.value).toBe(0);
    expect(stream.unhealthy.value).toBe(false);
    stream.disconnect();
  });

  it("stops reconnecting after disconnect", async () => {
    const stream = useEventSource(() => factory());
    stream.connect("http://x/events");
    sources[0]!.fail();
    stream.disconnect();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(sources).toHaveLength(1);
    expect(stream.status.value).toBe("idle");
  });
});

describe("realtime registry", () => {
  beforeEach(() => {
    __clearRealtimeListeners();
    refreshTick.value = 0;
  });

  afterEach(() => {
    __clearRealtimeListeners();
  });

  it("dispatches to subscribed handlers", () => {
    const seen: string[] = [];
    const off = onRealtimeEvent((e) => seen.push(e.type));
    dispatchRealtimeEvent({ id: 1, type: "task:created", data: {} });
    expect(seen).toEqual(["task:created"]);
    off();
    dispatchRealtimeEvent({ id: 2, type: "task:created", data: {} });
    expect(seen).toEqual(["task:created"]);
  });
});
