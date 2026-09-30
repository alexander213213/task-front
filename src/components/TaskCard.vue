<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { Task, TaskStatus } from "../services/types";
import type { BadgeVariants } from "./ui/badge";
import Badge from "./ui/badge/Badge.vue";
import Card from "./ui/card/Card.vue";

const props = defineProps<{ task: Task; clickable?: boolean }>();
const emit = defineEmits<{ open: [taskId: string] }>();

const now = ref(Date.now());
let timer: number | undefined;

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = Date.now();
  }, 10000);
});
onUnmounted(() => {
  if (timer !== undefined) window.clearInterval(timer);
});

const statusVariant = computed((): BadgeVariants["variant"] => {
  const map: Record<TaskStatus, BadgeVariants["variant"]> = {
    OPEN: "success",
    ASSIGNED: "warning",
    SUBMITTED: "info",
    COMPLETED: "secondary",
    CANCELLED: "destructive",
  };
  return map[props.task.status];
});

function formatDuration(ms: number): string {
  if (ms <= 0) return "Expired";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m ${seconds}s left`;
  return `${seconds}s left`;
}

const msLeft = computed(() => props.task.deadline.getTime() - now.value);
const timeText = computed(() => formatDuration(msLeft.value));
const urgencyVariant = computed((): BadgeVariants["variant"] => {
  if (msLeft.value <= 0) return "destructive";
  if (msLeft.value <= 60 * 60 * 1000) return "warning";
  return "success";
});

const rewardText = computed(() =>
  `₱${props.task.reward.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`
);
const deadlineText = computed(() => props.task.deadline.toLocaleString());
const createdText = computed(() => props.task.createdAt.toLocaleDateString());
const byline = computed(() =>
  props.task.owner ? `by ${props.task.owner.username} · ${createdText.value}` : createdText.value
);

function onOpen(): void {
  if (props.clickable) emit("open", props.task.id);
}
</script>

<template>
  <Card
    data-testid="task-card"
    :class="['w-full text-left', props.clickable ? 'cursor-pointer transition-shadow hover:shadow-lg' : '']"
    @click="onOpen"
  >
    <div class="flex items-start justify-between gap-3 p-5 pb-3">
      <div class="grid min-w-0 gap-1">
        <p class="truncate text-base font-semibold leading-tight">{{ task.title }}</p>
        <p class="text-sm text-muted-foreground">{{ byline }}</p>
      </div>
      <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <Badge :variant="statusVariant">{{ task.status }}</Badge>
        <Badge :variant="urgencyVariant">{{ timeText }}</Badge>
      </div>
    </div>

    <div class="px-5">
      <p v-if="task.description" class="line-clamp-3 text-sm leading-relaxed">{{ task.description }}</p>
      <p v-else class="text-sm text-muted-foreground">No description provided.</p>
    </div>

    <div class="flex flex-wrap items-end justify-between gap-4 p-5 pt-3">
      <dl class="grid flex-1 gap-1 text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-muted-foreground">Reward</dt>
          <dd class="font-semibold">{{ rewardText }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-muted-foreground">Deadline</dt>
          <dd>{{ deadlineText }}</dd>
        </div>
        <div v-if="task.tasker" class="flex justify-between gap-4">
          <dt class="text-muted-foreground">Assigned to</dt>
          <dd class="text-primary">{{ task.tasker.username }}</dd>
        </div>
      </dl>
      <div v-if="$slots.actions" class="flex gap-2">
        <slot name="actions" />
      </div>
    </div>
  </Card>
</template>
