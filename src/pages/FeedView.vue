<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import TaskCard from "../components/TaskCard.vue";
import AppHeader from "../components/AppHeader.vue";
import Badge from "../components/ui/badge/Badge.vue";
import Button from "../components/ui/button/Button.vue";
import Input from "../components/ui/input/Input.vue";
import Label from "../components/ui/label/Label.vue";
import Skeleton from "../components/ui/skeleton/Skeleton.vue";
import Separator from "../components/ui/separator/Separator.vue";
import { usePaginatedFeed } from "../composables/usePaginatedFeed";
import { tasksApi } from "../services/resources/tasks";
import type { TaskSort } from "../services/types";

const router = useRouter();

const sort = ref<TaskSort>("newest");
const q = ref("");
const minReward = ref("");
const maxReward = ref("");

const feed = usePaginatedFeed((cursor) =>
  tasksApi.feed({
    sort: sort.value,
    limit: 12,
    cursor,
    q: q.value.trim() || undefined,
    minReward: minReward.value.trim() ? Number(minReward.value) : undefined,
    maxReward: maxReward.value.trim() ? Number(maxReward.value) : undefined,
  })
);

const sorts: Array<{ value: TaskSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "reward_desc", label: "Top reward" },
  { value: "deadline_soon", label: "Ending soon" },
];

let debounce: number | undefined;
watch([q, minReward, maxReward], () => {
  window.clearTimeout(debounce);
  debounce = window.setTimeout(() => void feed.reload(), 400);
});
watch(sort, () => void feed.reload());
onUnmounted(() => window.clearTimeout(debounce));

const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | undefined;

onMounted(() => {
  void feed.loadInitial().catch((err: unknown) => {
    toast.error(err instanceof Error ? err.message : "Failed to load feed");
  });
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) void feed.loadMore();
    },
    { rootMargin: "400px" }
  );
  if (sentinel.value) observer.observe(sentinel.value);
});
onUnmounted(() => observer?.disconnect());

function openTask(id: string): void {
  void router.push(`/tasks/${id}`);
}

function clearFilters(): void {
  q.value = "";
  minReward.value = "";
  maxReward.value = "";
}
</script>

<template>
  <AppHeader />
  <main class="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Open tasks</h1>
        <p class="text-sm text-muted-foreground">Bid on work posted by others.</p>
      </div>
      <div class="flex gap-2" role="group" aria-label="Sort tasks">
        <Button
          v-for="s in sorts"
          :key="s.value"
          :variant="sort === s.value ? 'secondary' : 'ghost'"
          size="sm"
          @click="sort = s.value"
        >
          {{ s.label }}
        </Button>
      </div>
    </div>

    <div class="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_140px_140px_auto]">
      <div class="grid gap-1.5">
        <Label for="feed-q">Search</Label>
        <Input id="feed-q" v-model="q" placeholder="Title or description..." />
      </div>
      <div class="grid gap-1.5">
        <Label for="feed-min">Min reward</Label>
        <Input id="feed-min" v-model="minReward" inputmode="numeric" placeholder="0" />
      </div>
      <div class="grid gap-1.5">
        <Label for="feed-max">Max reward</Label>
        <Input id="feed-max" v-model="maxReward" inputmode="numeric" placeholder="Any" />
      </div>
      <div class="flex items-end">
        <Button variant="ghost" size="sm" @click="clearFilters">Clear</Button>
      </div>
    </div>

    <div v-if="feed.loading.value" class="grid gap-4">
      <Skeleton v-for="n in [0, 1, 2]" :key="n" class="h-48 w-full" />
    </div>

    <div v-else-if="feed.error.value && feed.items.value.length === 0" class="grid justify-items-center gap-3 py-16 text-center">
      <p class="text-sm text-destructive">{{ feed.error.value }}</p>
      <Button variant="outline" @click="feed.reload()">Retry</Button>
    </div>

    <div v-else-if="feed.items.value.length === 0" class="grid justify-items-center gap-2 py-16 text-center">
      <p class="font-medium">No open tasks match</p>
      <p class="text-sm text-muted-foreground">Try widening the search or check back later.</p>
    </div>

    <div v-else class="grid gap-4">
      <TaskCard
        v-for="task in feed.items.value"
        :key="task.id"
        :task="task"
        clickable
        @open="openTask"
      />
    </div>

    <div ref="sentinel" class="flex justify-center py-2">
      <p v-if="feed.loadingMore.value" class="text-sm text-muted-foreground">Loading more...</p>
      <p v-else-if="!feed.hasMore.value && feed.items.value.length > 0" class="flex items-center gap-3 text-sm text-muted-foreground">
        <Separator class="w-16" /> You're all caught up <Separator class="w-16" />
      </p>
      <Badge v-else-if="feed.error.value" variant="destructive">{{ feed.error.value }}</Badge>
    </div>
  </main>
</template>
