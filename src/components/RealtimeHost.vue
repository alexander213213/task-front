<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { useAuth } from "../composables/useAuth";
import { useEventSource, type StreamEvent } from "../composables/useEventSource";
import { bumpRefreshTick, dispatchRealtimeEvent } from "../composables/useRealtime";

const API_BASE = import.meta.env.VITE_API_URL as string;

const router = useRouter();
const auth = useAuth();
const stream = useEventSource();

let fallbackTimer: number | undefined;

interface TaskPayload {
  taskId?: string;
  title?: string;
  stars?: number;
}

function taskIdOf(event: StreamEvent): string | undefined {
  const data = event.data as TaskPayload | null;
  return typeof data === "object" && data !== null ? data.taskId : undefined;
}

function viewAction(taskId: string | undefined) {
  if (!taskId) return undefined;
  return {
    label: "View",
    onClick: () => void router.push(`/tasks/${taskId}`),
  };
}

const NOTIFICATIONS: Record<string, (e: StreamEvent) => { message: string; taskId?: string }> = {
  "proposal:created": (e) => ({
    message: `New proposal: ${(e.data as TaskPayload)?.title ?? "a task"}`,
    taskId: taskIdOf(e),
  }),
  "task:assigned": (e) => ({
    message: `You were assigned: ${(e.data as TaskPayload)?.title ?? "a task"}`,
    taskId: taskIdOf(e),
  }),
  "task:unassigned": (e) => ({
    message: `You were unassigned: ${(e.data as TaskPayload)?.title ?? "a task"}`,
    taskId: taskIdOf(e),
  }),
  "task:submitted": (e) => ({
    message: `Work submitted: ${(e.data as TaskPayload)?.title ?? "a task"}`,
    taskId: taskIdOf(e),
  }),
  "task:confirmed": (e) => ({
    message: `Task confirmed: ${(e.data as TaskPayload)?.title ?? "a task"}`,
    taskId: taskIdOf(e),
  }),
  "review:received": (e) => {
    const stars = (e.data as TaskPayload)?.stars;
    return {
      message: typeof stars === "number" ? `New ${stars}-star review` : "New review",
      taskId: taskIdOf(e),
    };
  },
};

function handleEvent(event: StreamEvent): void {
  dispatchRealtimeEvent(event);
  const format = NOTIFICATIONS[event.type];
  if (!format) return; // task:created drives feed pills, not toasts.
  const { message, taskId } = format(event);
  const action = viewAction(taskId);
  if (action) toast.success(message, { action });
  else toast.success(message);
}

function startFallback(): void {
  stopFallback();
  fallbackTimer = window.setInterval(() => bumpRefreshTick(), 45_000);
}

function stopFallback(): void {
  window.clearInterval(fallbackTimer);
  fallbackTimer = undefined;
}

let wired = false;

function connect(): void {
  if (!API_BASE) return;
  // Register once: reconnects reuse the same handlers.
  if (!wired) {
    for (const type of Object.keys(NOTIFICATIONS)) {
      stream.on(type, handleEvent);
    }
    stream.on("task:created", handleEvent);
    wired = true;
  }
  stream.connect(`${API_BASE}/events`);
}

watch(
  () => auth.isAuthed.value,
  (authed) => {
    if (authed) connect();
    else {
      stopFallback();
      stream.disconnect();
    }
  }
);

watch(
  () => stream.unhealthy.value,
  (unhealthy) => {
    if (unhealthy && auth.isAuthed.value) startFallback();
    else stopFallback();
  }
);

onMounted(() => {
  if (auth.isAuthed.value) connect();
});

onUnmounted(() => {
  stopFallback();
  stream.disconnect();
});
</script>

<template>
  <!-- Renderless: owns the SSE connection, toasts, and fallback polling. -->
  <span style="display: none" />
</template>
