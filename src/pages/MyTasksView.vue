<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { z } from "zod";
import { toast } from "vue-sonner";
import AppHeader from "../components/AppHeader.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import StarsInput from "../components/StarsInput.vue";
import TaskCard from "../components/TaskCard.vue";
import Button from "../components/ui/button/Button.vue";
import Dialog from "../components/ui/dialog/Dialog.vue";
import DialogContent from "../components/ui/dialog/DialogContent.vue";
import DialogDescription from "../components/ui/dialog/DialogDescription.vue";
import DialogFooter from "../components/ui/dialog/DialogFooter.vue";
import DialogTitle from "../components/ui/dialog/DialogTitle.vue";
import Input from "../components/ui/input/Input.vue";
import Label from "../components/ui/label/Label.vue";
import Skeleton from "../components/ui/skeleton/Skeleton.vue";
import Textarea from "../components/ui/textarea/Textarea.vue";
import { useForm } from "../composables/useForm";
import { usePaginatedFeed } from "../composables/usePaginatedFeed";
import { ApiError } from "../services/api";
import { tasksApi } from "../services/resources/tasks";
import type { Task, TaskStatus } from "../services/types";

const router = useRouter();

const filters: Array<{ value: TaskStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];
const statusFilter = ref<TaskStatus | "ALL">("ALL");

const feed = usePaginatedFeed((cursor) =>
  tasksApi.mine({ limit: 12, cursor, status: statusFilter.value === "ALL" ? undefined : statusFilter.value })
);
watch(statusFilter, () => void feed.reload());
onMounted(() => void feed.loadInitial());

function refreshError(err: unknown, fallback: string): void {
  toast.error(err instanceof ApiError ? err.message : fallback);
}

// ---- Create ----
const createSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  reward: z.number({ message: "Reward is required" }).positive("Reward must be positive"),
  deadline: z.string().min(1, "Deadline is required").refine((v) => new Date(v).getTime() > Date.now(), {
    message: "Deadline must be in the future",
  }),
});
const createForm = useForm(createSchema, { title: "", description: "", reward: 0 as number, deadline: "" });
const showCreate = ref(false);

function openCreate(): void {
  createForm.reset({ title: "", description: "", reward: 0 as number, deadline: "" });
  showCreate.value = true;
}

async function submitCreate(): Promise<void> {
  const valid = createForm.validateAll();
  if (!valid.ok) return;
  createForm.submitting.value = true;
  try {
    const res = await tasksApi.create({
      title: valid.data.title.trim(),
      description: valid.data.description?.trim() || undefined,
      reward: valid.data.reward,
      deadline: new Date(valid.data.deadline).toISOString(),
    });
    feed.prepend(res.task);
    toast.success("Task posted");
    showCreate.value = false;
  } catch (err) {
    if (err instanceof ApiError) {
      createForm.applyServerError(err);
      refreshError(err, "Failed to post task");
    } else refreshError(err, "Failed to post task");
  } finally {
    createForm.submitting.value = false;
  }
}

// ---- Edit (changed fields sent as sequential single-op patches) ----
const editSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000),
  reward: z.number({ message: "Reward is required" }).positive("Reward must be positive"),
  deadline: z.string().min(1, "Deadline is required"),
});
const editForm = useForm(editSchema, { title: "", description: "", reward: 0 as number, deadline: "" });
const editing = ref<Task | null>(null);

function toLocalInput(d: Date): string {
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function openEdit(task: Task): void {
  editForm.reset({
    title: task.title,
    description: task.description ?? "",
    reward: task.reward,
    deadline: toLocalInput(task.deadline),
  });
  editing.value = task;
}

async function submitEdit(): Promise<void> {
  const valid = editForm.validateAll();
  const original = editing.value;
  if (!valid.ok || !original) return;
  const ops: Array<Record<string, unknown>> = [];
  if (valid.data.title.trim() !== original.title) {
    ops.push({ op: "replace", path: "/title", value: valid.data.title.trim() });
  }
  const desc = valid.data.description.trim();
  if (desc !== (original.description ?? "")) {
    ops.push(desc ? { op: "replace", path: "/description", value: desc } : { op: "remove", path: "/description" });
  }
  if (valid.data.reward !== original.reward) {
    ops.push({ op: "replace", path: "/reward", value: valid.data.reward });
  }
  editForm.submitting.value = true;
  try {
    for (const op of ops) {
      await tasksApi.patch(original.id, op);
    }
    if (ops.length === 0) toast.success("No changes to save");
    else {
      toast.success("Task updated");
      await feed.reload();
    }
    editing.value = null;
  } catch (err) {
    refreshError(err, "Failed to update task");
  } finally {
    editForm.submitting.value = false;
  }
}

// ---- Confirm + review (one flow, like the lifecycle demands) ----
const reviewSchema = z.object({
  rating: z.number().min(1, "Pick a star rating"),
  comment: z.string().max(1000, "At most 1000 characters"),
});
const reviewForm = useForm(reviewSchema, { rating: 0, comment: "" });
const confirming = ref<Task | null>(null);

function openConfirm(task: Task): void {
  reviewForm.reset({ rating: 0, comment: "" });
  confirming.value = task;
}

async function submitConfirm(): Promise<void> {
  const valid = reviewForm.validateAll();
  const task = confirming.value;
  if (!valid.ok || !task) return;
  reviewForm.submitting.value = true;
  try {
    await tasksApi.confirm(task.id);
    await tasksApi.review(task.id, valid.data.rating, valid.data.comment.trim());
    toast.success("Work confirmed and reviewed");
    confirming.value = null;
    await feed.reload();
  } catch (err) {
    refreshError(err, "Failed to confirm task");
  } finally {
    reviewForm.submitting.value = false;
  }
}

// ---- Destructive / state actions behind one confirm dialog ----
interface PendingAction {
  kind: "delete" | "cancel" | "unassign";
  task: Task;
}
const pending = ref<PendingAction | null>(null);
const acting = ref(false);

const ACTION_COPY: Record<PendingAction["kind"], { title: string; description: string; confirm: string }> = {
  delete: { title: "Delete task?", description: "This permanently removes the task and its proposals.", confirm: "Delete" },
  cancel: { title: "Cancel task?", description: "Open tasks can be cancelled; assigned work ends.", confirm: "Cancel task" },
  unassign: { title: "Unassign tasker?", description: "The task returns to open and proposals reopen.", confirm: "Unassign" },
};

async function runPending(): Promise<void> {
  const action = pending.value;
  if (!action) return;
  acting.value = true;
  try {
    if (action.kind === "delete") await tasksApi.remove(action.task.id);
    if (action.kind === "cancel") await tasksApi.cancel(action.task.id);
    if (action.kind === "unassign") await tasksApi.unassign(action.task.id);
    toast.success(action.kind === "delete" ? "Deleted" : action.kind === "cancel" ? "Cancelled" : "Unassigned");
    pending.value = null;
    await feed.reload();
  } catch (err) {
    refreshError(err, "Action failed");
  } finally {
    acting.value = false;
  }
}
</script>

<template>
  <AppHeader />
  <main class="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">My tasks</h1>
        <p class="text-sm text-muted-foreground">Everything you posted, with proposal counts.</p>
      </div>
      <Button @click="openCreate">Post a task</Button>
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
      <p class="font-medium">Nothing here yet</p>
      <p class="text-sm text-muted-foreground">Post your first task to get proposals.</p>
    </div>

    <div v-else class="grid gap-4">
      <TaskCard v-for="task in feed.items.value" :key="task.id" :task="task">
        <template #actions>
          <Button variant="ghost" size="sm" @click="router.push(`/tasks/${task.id}`)">View</Button>
          <template v-if="task.status === 'OPEN'">
            <Button variant="outline" size="sm" @click="openEdit(task)">Edit</Button>
            <Button variant="outline" size="sm" @click="pending = { kind: 'cancel', task }">Cancel</Button>
            <Button variant="ghost" size="sm" class="text-destructive" @click="pending = { kind: 'delete', task }">Delete</Button>
          </template>
          <template v-else-if="task.status === 'ASSIGNED' || task.status === 'SUBMITTED'">
            <Button variant="outline" size="sm" @click="pending = { kind: 'unassign', task }">Unassign</Button>
            <Button v-if="task.status === 'SUBMITTED'" size="sm" @click="openConfirm(task)">Confirm + review</Button>
          </template>
        </template>
      </TaskCard>
    </div>

    <div class="flex justify-center py-2">
      <Button v-if="feed.hasMore.value" variant="outline" :disabled="feed.loadingMore.value" @click="feed.loadMore()">
        {{ feed.loadingMore.value ? "Loading..." : "Load more" }}
      </Button>
      <p v-else-if="feed.items.value.length > 0" class="text-sm text-muted-foreground">That's everything.</p>
    </div>

    <!-- Create dialog -->
    <Dialog :open="showCreate" @update:open="showCreate = $event">
      <DialogContent>
        <DialogTitle>Post a task</DialogTitle>
        <DialogDescription>Describe the work, set a reward, and pick a deadline.</DialogDescription>
        <form class="grid gap-4" @submit.prevent="submitCreate">
          <div class="grid gap-2">
            <Label for="create-title">Title</Label>
            <Input id="create-title" v-model="createForm.values.title" placeholder="What needs doing?" @blur="createForm.touch('title')" />
            <p v-if="createForm.getError('title')" class="text-xs text-destructive">{{ createForm.getError('title') }}</p>
          </div>
          <div class="grid gap-2">
            <Label for="create-desc">Description</Label>
            <Textarea id="create-desc" v-model="createForm.values.description" placeholder="Details, acceptance criteria..." @blur="createForm.touch('description')" />
            <p v-if="createForm.getError('description')" class="text-xs text-destructive">{{ createForm.getError('description') }}</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="grid gap-2">
              <Label for="create-reward">Reward (₱)</Label>
              <Input id="create-reward" v-model.number="createForm.values.reward" type="number" min="1" @blur="createForm.touch('reward')" />
              <p v-if="createForm.getError('reward')" class="text-xs text-destructive">{{ createForm.getError('reward') }}</p>
            </div>
            <div class="grid gap-2">
              <Label for="create-deadline">Deadline</Label>
              <Input id="create-deadline" v-model="createForm.values.deadline" type="datetime-local" @blur="createForm.touch('deadline')" />
              <p v-if="createForm.getError('deadline')" class="text-xs text-destructive">{{ createForm.getError('deadline') }}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" :disabled="createForm.submitting.value" @click="showCreate = false">Cancel</Button>
            <Button type="submit" :disabled="createForm.submitting.value">{{ createForm.submitting.value ? "Posting..." : "Post task" }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit dialog -->
    <Dialog :open="editing !== null" @update:open="editing = $event ? editing : null">
      <DialogContent>
        <DialogTitle>Edit task</DialogTitle>
        <DialogDescription>Only changed fields are saved.</DialogDescription>
        <form class="grid gap-4" @submit.prevent="submitEdit">
          <div class="grid gap-2">
            <Label for="edit-title">Title</Label>
            <Input id="edit-title" v-model="editForm.values.title" @blur="editForm.touch('title')" />
            <p v-if="editForm.getError('title')" class="text-xs text-destructive">{{ editForm.getError('title') }}</p>
          </div>
          <div class="grid gap-2">
            <Label for="edit-desc">Description</Label>
            <Textarea id="edit-desc" v-model="editForm.values.description" @blur="editForm.touch('description')" />
            <p v-if="editForm.getError('description')" class="text-xs text-destructive">{{ editForm.getError('description') }}</p>
          </div>
          <div class="grid gap-2">
            <Label for="edit-reward">Reward (₱)</Label>
            <Input id="edit-reward" v-model.number="editForm.values.reward" type="number" min="1" @blur="editForm.touch('reward')" />
            <p v-if="editForm.getError('reward')" class="text-xs text-destructive">{{ editForm.getError('reward') }}</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" :disabled="editForm.submitting.value" @click="editing = null">Cancel</Button>
            <Button type="submit" :disabled="editForm.submitting.value">{{ editForm.submitting.value ? "Saving..." : "Save changes" }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Confirm + review dialog -->
    <Dialog :open="confirming !== null" @update:open="confirming = $event ? confirming : null">
      <DialogContent>
        <DialogTitle>Confirm completion</DialogTitle>
        <DialogDescription>Confirm the work, then leave a rating. This completes the task.</DialogDescription>
        <form class="grid gap-4" @submit.prevent="submitConfirm">
          <div class="grid gap-2">
            <Label>Rating</Label>
            <StarsInput v-model="reviewForm.values.rating" />
            <p v-if="reviewForm.getError('rating')" class="text-xs text-destructive">{{ reviewForm.getError('rating') }}</p>
          </div>
          <div class="grid gap-2">
            <Label for="review-comment">Comment</Label>
            <Textarea id="review-comment" v-model="reviewForm.values.comment" placeholder="How did it go?" @blur="reviewForm.touch('comment')" />
            <p v-if="reviewForm.getError('comment')" class="text-xs text-destructive">{{ reviewForm.getError('comment') }}</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" :disabled="reviewForm.submitting.value" @click="confirming = null">Cancel</Button>
            <Button type="submit" :disabled="reviewForm.submitting.value">{{ reviewForm.submitting.value ? "Confirming..." : "Confirm + review" }}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Destructive confirm -->
    <ConfirmDialog
      :open="pending !== null"
      :title="pending ? ACTION_COPY[pending.kind].title : ''"
      :description="pending ? ACTION_COPY[pending.kind].description : ''"
      :confirm-label="pending ? ACTION_COPY[pending.kind].confirm : ''"
      :destructive="pending?.kind === 'delete'"
      :busy="acting"
      @update:open="pending = $event ? pending : null"
      @confirm="runPending"
    />
  </main>
</template>
