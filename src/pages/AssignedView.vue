<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import AppHeader from "../components/AppHeader.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import TaskCard from "../components/TaskCard.vue";
import Button from "../components/ui/button/Button.vue";
import Skeleton from "../components/ui/skeleton/Skeleton.vue";
import { usePaginatedFeed } from "../composables/usePaginatedFeed";
import { ApiError } from "../services/api";
import { tasksApi } from "../services/resources/tasks";
import type { Task, TaskStatus } from "../services/types";

const router = useRouter();

const filters: Array<{ value: TaskStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "ASSIGNED", label: "To do" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "COMPLETED", label: "Completed" },
];
const statusFilter = ref<TaskStatus | "ALL">("ALL");

const feed = usePaginatedFeed((cursor) =>
  tasksApi.assigned({ limit: 12, cursor, status: statusFilter.value === "ALL" ? undefined : statusFilter.value })
);
watch(statusFilter, () => void feed.reload());
onMounted(() => void feed.loadInitial());

const submitting = ref<Task | null>(null);
const busy = ref(false);

async function submitWork(): Promise<void> {
  const task = submitting.value;
  if (!task) return;
  busy.value = true;
  try {
    await tasksApi.submit(task.id);
    toast.success("Work submitted for review");
    submitting.value = null;
    await feed.reload();
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : "Submission failed");
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <AppHeader />
  <main class="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Assigned to you</h1>
      <p class="text-sm text-muted-foreground">Work you picked up, and its review state.</p>
    </div>

    <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
      <Button
        v-for="f in filters"
        :key="f.value"
        :variant="statusFilter === f.value ? 'secondary' : 'ghost'"
        size="sm"
        @click="statusFilter = f.value"
      >
        {{ f.label }}
      </Button>
    </div>

    <div v-if="feed.loading.value" class="grid gap-4">
      <Skeleton v-for="n in [0, 1]" :key="n" class="h-48 w-full" />
    </div>

    <div v-else-if="feed.error.value && feed.items.value.length === 0" class="grid justify-items-center gap-3 py-16 text-center">
      <p class="text-sm text-destructive">{{ feed.error.value }}</p>
      <Button variant="outline" @click="feed.reload()">Retry</Button>
    </div>

    <div v-else-if="feed.items.value.length === 0" class="grid justify-items-center gap-2 py-16 text-center">
      <p class="font-medium">No assigned work</p>
      <p class="text-sm text-muted-foreground">Proposals you win will show up here.</p>
    </div>

    <div v-else class="grid gap-4">
      <TaskCard v-for="task in feed.items.value" :key="task.id" :task="task">
        <template #actions>
          <Button variant="ghost" size="sm" @click="router.push(`/tasks/${task.id}`)">View</Button>
          <Button v-if="task.status === 'ASSIGNED'" size="sm" @click="submitting = task">Submit work</Button>
        </template>
      </TaskCard>
    </div>

    <div class="flex justify-center py-2">
      <Button v-if="feed.hasMore.value" variant="outline" :disabled="feed.loadingMore.value" @click="feed.loadMore()">
        {{ feed.loadingMore.value ? "Loading..." : "Load more" }}
      </Button>
      <p v-else-if="feed.items.value.length > 0" class="text-sm text-muted-foreground">That's everything.</p>
    </div>

    <ConfirmDialog
      :open="submitting !== null"
      title="Submit work?"
      description="The owner will review it and either confirm completion or send it back."
      confirm-label="Submit"
      :busy="busy"
      @update:open="submitting = $event ? submitting : null"
      @confirm="submitWork"
    />
  </main>
</template>
