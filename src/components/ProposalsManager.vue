<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { toast } from "vue-sonner";
import Avatar from "./ui/avatar/Avatar.vue";
import Badge from "./ui/badge/Badge.vue";
import Button from "./ui/button/Button.vue";
import Card from "./ui/card/Card.vue";
import ConfirmDialog from "./ConfirmDialog.vue";
import Separator from "./ui/separator/Separator.vue";
import Skeleton from "./ui/skeleton/Skeleton.vue";
import StarsInput from "./StarsInput.vue";
import { ApiError } from "../services/api";
import { proposalsApi, tasksApi } from "../services/resources/tasks";
import type { Proposal, TaskStatus } from "../services/types";

const props = defineProps<{
  taskId: string;
  taskStatus: TaskStatus;
  assigneeUsername?: string | null;
}>();
const emit = defineEmits<{ assigned: [taskId: string] }>();

const proposals = ref<Proposal[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);
const assigning = ref<Proposal | null>(null);
const busy = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  loadError.value = null;
  try {
    const res = await proposalsApi.list(props.taskId);
    proposals.value = res.proposals;
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : "Failed to load proposals";
  } finally {
    loading.value = false;
  }
}

async function assign(): Promise<void> {
  const proposal = assigning.value;
  if (!proposal) return;
  busy.value = true;
  try {
    await tasksApi.assign(props.taskId, proposal.userId);
    toast.success(`Assigned to ${proposal.user?.username ?? "tasker"}`);
    assigning.value = null;
    emit("assigned", props.taskId);
    await load();
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : "Assignment failed");
  } finally {
    busy.value = false;
  }
}

function proposalDate(p: Proposal): string {
  return p.createdAt.toLocaleDateString();
}

onMounted(() => void load());
watch(
  () => props.taskId,
  () => void load()
);

defineExpose({ reload: load });
</script>

<template>
  <Card>
    <div class="grid gap-4 p-5">
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold">Proposals ({{ proposals.length }})</p>
        <Button variant="ghost" size="sm" :disabled="loading" @click="load()">Refresh</Button>
      </div>

      <div v-if="loading" class="grid gap-3">
        <Skeleton v-for="n in [0, 1]" :key="n" class="h-28 w-full" />
      </div>

      <div v-else-if="loadError" class="grid justify-items-center gap-2 py-6 text-center">
        <p class="text-sm text-destructive">{{ loadError }}</p>
        <Button variant="outline" size="sm" @click="load()">Retry</Button>
      </div>

      <p v-else-if="proposals.length === 0" class="py-4 text-center text-sm text-muted-foreground">
        No proposals yet. New bids will appear here.
      </p>

      <div v-else class="grid gap-4">
        <div v-for="proposal in proposals" :key="proposal.userId" class="grid gap-2">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2">
              <Avatar :alt="proposal.user?.username" class="h-8 w-8 text-xs" />
              <div>
                <p class="text-sm font-semibold">{{ proposal.user?.username ?? "Unknown" }}</p>
                <p class="text-xs text-muted-foreground">{{ proposalDate(proposal) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <StarsInput :model-value="Math.round(proposal.user?.ratingAvg ?? 0)" disabled :size="14" />
              <span class="text-xs text-muted-foreground">
                ({{ proposal.user?.ratingAvg?.toFixed(1) ?? "–" }} · {{ proposal.user?.ratingCount ?? 0 }})
              </span>
            </div>
          </div>
          <p class="text-sm font-medium">{{ proposal.title }}</p>
          <p class="text-sm text-muted-foreground">{{ proposal.body }}</p>
          <div class="flex justify-end">
            <Badge v-if="proposal.user?.username !== undefined && proposal.user.username === props.assigneeUsername" variant="success">Assigned</Badge>
            <Button
              v-else-if="props.taskStatus === 'OPEN'"
              size="sm"
              :disabled="busy"
              @click="assigning = proposal"
            >
              Assign
            </Button>
          </div>
          <Separator />
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="assigning !== null"
      title="Assign this tasker?"
      :description="assigning ? `Assign the task to ${assigning.user?.username ?? 'this tasker'}? They will be notified.` : ''"
      confirm-label="Assign"
      :busy="busy"
      @update:open="assigning = $event ? assigning : null"
      @confirm="assign"
    />
  </Card>
</template>
