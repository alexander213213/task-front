<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import { toast } from "vue-sonner";
import AppHeader from "../components/AppHeader.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import ProposalsManager from "../components/ProposalsManager.vue";
import TaskCard from "../components/TaskCard.vue";
import Badge from "../components/ui/badge/Badge.vue";
import Button from "../components/ui/button/Button.vue";
import Card from "../components/ui/card/Card.vue";
import Dialog from "../components/ui/dialog/Dialog.vue";
import DialogContent from "../components/ui/dialog/DialogContent.vue";
import DialogDescription from "../components/ui/dialog/DialogDescription.vue";
import DialogFooter from "../components/ui/dialog/DialogFooter.vue";
import DialogTitle from "../components/ui/dialog/DialogTitle.vue";
import Input from "../components/ui/input/Input.vue";
import Label from "../components/ui/label/Label.vue";
import Separator from "../components/ui/separator/Separator.vue";
import Skeleton from "../components/ui/skeleton/Skeleton.vue";
import Textarea from "../components/ui/textarea/Textarea.vue";
import { useAuth } from "../composables/useAuth";
import { useForm } from "../composables/useForm";
import { ApiError } from "../services/api";
import { proposalsApi, tasksApi } from "../services/resources/tasks";
import type { TaskDetail } from "../services/types";

const route = useRoute();
const router = useRouter();
const auth = useAuth();

const taskId = computed(() => String(route.params.id ?? ""));
const detail = ref<TaskDetail | null>(null);
const loading = ref(true);
const loadError = ref<string | null>(null);

const proposalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "At most 200 characters"),
  body: z.string().min(10, "Tell the owner a little more (min 10 characters)").max(2000),
});
const proposalForm = useForm(proposalSchema, { title: "", body: "" });
const showProposal = ref(false);
const editingProposal = ref(false);
const withdrawing = ref(false);
const acting = ref(false);

const isOwner = computed(() => detail.value !== null && auth.user.value !== null && detail.value.ownerId === auth.user.value.id);
const canPropose = computed(
  () => detail.value !== null && !isOwner.value && detail.value.status === "OPEN" && !detail.value.myProposal
);
const canManageProposal = computed(
  () => detail.value !== null && !isOwner.value && detail.value.status === "OPEN" && detail.value.myProposal !== null
);

async function load(): Promise<void> {
  loading.value = true;
  loadError.value = null;
  try {
    const res = await tasksApi.detail(taskId.value);
    detail.value = res.task;
  } catch (err) {
    loadError.value = err instanceof ApiError && err.is("NOT_FOUND") ? "Task not found" : "Failed to load task";
  } finally {
    loading.value = false;
  }
}

function openProposal(): void {
  proposalForm.reset();
  editingProposal.value = false;
  showProposal.value = true;
}

function openEditProposal(): void {
  const mine = detail.value?.myProposal;
  proposalForm.reset({ title: mine?.title ?? "", body: mine?.body ?? "" });
  editingProposal.value = true;
  showProposal.value = true;
}

async function submitProposal(): Promise<void> {
  const valid = proposalForm.validateAll();
  if (!valid.ok) return;
  proposalForm.submitting.value = true;
  try {
    if (editingProposal.value) {
      await proposalsApi.editMine(taskId.value, valid.data.title.trim(), valid.data.body.trim());
      toast.success("Proposal updated");
    } else {
      await proposalsApi.create(taskId.value, valid.data.title.trim(), valid.data.body.trim());
      toast.success("Proposal sent");
    }
    showProposal.value = false;
    await load();
  } catch (err) {
    if (err instanceof ApiError) {
      proposalForm.applyServerError(err);
      toast.error(err.message);
    } else {
      toast.error("Failed to send proposal");
    }
  } finally {
    proposalForm.submitting.value = false;
  }
}

async function withdrawProposal(): Promise<void> {
  acting.value = true;
  try {
    await proposalsApi.withdrawMine(taskId.value);
    toast.success("Proposal withdrawn");
    withdrawing.value = false;
    await load();
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : "Withdrawal failed");
  } finally {
    acting.value = false;
  }
}

onMounted(() => void load());
</script>

<template>
  <AppHeader />
  <main class="mx-auto grid w-full max-w-3xl gap-6 px-4 py-6">
    <Button variant="ghost" size="sm" class="w-fit" @click="router.back()">← Back</Button>

    <div v-if="loading" class="grid gap-4">
      <Skeleton class="h-64 w-full" />
      <Skeleton class="h-32 w-full" />
    </div>

    <div v-else-if="loadError || !detail" class="grid justify-items-center gap-3 py-16 text-center">
      <p class="font-medium">{{ loadError ?? "Task not found" }}</p>
      <Button variant="outline" @click="router.push('/feed')">Back to feed</Button>
    </div>

    <template v-else>
      <TaskCard :task="detail" />

      <div class="flex flex-wrap gap-2">
        <Button v-if="canPropose" @click="openProposal">Make a proposal</Button>
        <Badge v-else-if="detail.myProposal" variant="secondary">You proposed on this task</Badge>
        <Badge v-else-if="isOwner" variant="secondary">{{ detail.proposalCount }} proposal{{ detail.proposalCount === 1 ? "" : "s" }} · manage in My tasks</Badge>
      </div>

      <Card v-if="detail.myProposal">
        <div class="grid gap-2 p-5">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-semibold">Your proposal</p>
            <div v-if="canManageProposal" class="flex gap-2">
              <Button variant="outline" size="sm" @click="openEditProposal">Edit</Button>
              <Button variant="ghost" size="sm" class="text-destructive" @click="withdrawing = true">Withdraw</Button>
            </div>
          </div>
          <p class="text-sm font-medium">{{ detail.myProposal.title }}</p>
          <p class="text-sm text-muted-foreground">{{ detail.myProposal.body }}</p>
        </div>
      </Card>

      <ProposalsManager
        v-if="isOwner && detail.status === 'OPEN'"
        :task-id="detail.id"
        :task-status="detail.status"
        :assignee-username="detail.tasker?.username ?? null"
        @assigned="load"
      />

      <Card v-if="detail.tasker">
        <div class="flex items-center justify-between gap-3 p-5">
          <div>
            <p class="text-sm text-muted-foreground">Assigned to</p>
            <p class="font-semibold">{{ detail.tasker.username }}</p>
          </div>
        </div>
      </Card>

      <Card v-if="detail.review">
        <div class="grid gap-2 p-5">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold">Owner review</p>
            <Badge variant="success">{{ detail.review.stars }} / 5</Badge>
          </div>
          <Separator />
          <p class="text-sm">{{ detail.review.comment }}</p>
        </div>
      </Card>
    </template>

    <Dialog :open="showProposal" @update:open="showProposal = $event">
      <DialogContent>
        <DialogTitle>{{ editingProposal ? "Edit proposal" : "Send proposal" }}</DialogTitle>
        <DialogDescription>Explain why you're the right person for this task.</DialogDescription>
        <form class="grid gap-4" @submit.prevent="submitProposal">
          <div class="grid gap-2">
            <Label for="prop-title">Title</Label>
            <Input id="prop-title" v-model="proposalForm.values.title" placeholder="Short proposal title" @blur="proposalForm.touch('title')" />
            <p v-if="proposalForm.getError('title')" class="text-xs text-destructive">{{ proposalForm.getError('title') }}</p>
          </div>
          <div class="grid gap-2">
            <Label for="prop-body">Details</Label>
            <Textarea id="prop-body" v-model="proposalForm.values.body" placeholder="Experience, timeline, approach..." @blur="proposalForm.touch('body')" />
            <p v-if="proposalForm.getError('body')" class="text-xs text-destructive">{{ proposalForm.getError('body') }}</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" :disabled="proposalForm.submitting.value" @click="showProposal = false">Cancel</Button>
            <Button type="submit" :disabled="proposalForm.submitting.value">
              {{ proposalForm.submitting.value ? "Saving..." : editingProposal ? "Save changes" : "Submit proposal" }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <ConfirmDialog
      :open="withdrawing"
      title="Withdraw proposal?"
      description="Your bid will be removed from this task."
      confirm-label="Withdraw"
      destructive
      :busy="acting"
      @update:open="withdrawing = $event"
      @confirm="withdrawProposal"
    />
  </main>
</template>
