import { onUnmounted, ref } from "vue";
import type { StreamEvent } from "./useEventSource";

export type RealtimeHandler = (event: StreamEvent) => void;

const listeners = new Set<RealtimeHandler>();

/**
 * Bumped by the realtime host while the stream is unhealthy, so views can
 * poll as a fallback. Views watch it and reload; it carries no payload.
 */
export const refreshTick = ref(0);

export function bumpRefreshTick(): void {
  refreshTick.value += 1;
}

/** Subscribe to stream events. Auto-unsubscribes when the caller unmounts. */
export function onRealtimeEvent(fn: RealtimeHandler): () => void {
  listeners.add(fn);
  onUnmounted(() => {
    listeners.delete(fn);
  });
  return () => {
    listeners.delete(fn);
  };
}

/** Called by the host only. */
export function dispatchRealtimeEvent(event: StreamEvent): void {
  for (const fn of [...listeners]) fn(event);
}

/** Test isolation. */
export function __clearRealtimeListeners(): void {
  listeners.clear();
}
