<script setup lang="ts">
import { useDialog, useMessage, type FormInst, type FormRules } from 'naive-ui';
import { api } from '../services/api';
import { withQuery } from '../utils/query';
import { onMounted, ref, watch } from 'vue';
import Task, { type ButtonTypes } from '../components/Task.vue';
import type { UserData } from './Login.vue';
import { User, ArrowLeft, Plus } from "@vicons/fa"
import Proposal from '../components/Proposal.vue';
import { useRouter } from 'vue-router';

export type Task = {
  owner: {
    username: string;
  };
  tasker?: {
    username: string;
  };
  title: string;
  description: string | null;
  reward: number;
  deadline: Date;
  id: string;
  createdAt: Date;
  ownerId: string;
  status: "OPEN" | "ASSIGNED" | "SUBMITTED" | "COMPLETED" | "CANCELLED";
}


type Proposal = {
  title: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  userId: string;
  body: string;
  user: {
    username: string;
    ratingAvg: number;
    ratingCount: number;
  };
}


const props = defineProps<{
  user?: UserData,
  removeUser: () => void
}>()


const router = useRouter()


if (!props.user) {
  router.push("/auth/login")
}

const message = useMessage()
const dialog = useDialog()
const tasks = ref<Task[]>([])
const currentCursor = ref<string | null>(null)

const currentSort = ref<"newest" | "reward_desc" | "deadline_soon">("newest")

const showModal = ref<boolean>(false)
const showDrawer = ref<boolean>(false)

const selectedTaskId = ref<string | null>(null)
const loading = ref<boolean>(false)
const formRef = ref<FormInst | null>(null)

const myTasks = ref<Omit<Task, "owner">[]>([])

const drawerContent = ref<"Tasks" | "Proposals">("Tasks")
const drawerSelectedTaskId = ref<string | null>(null)
const proposalsToShow = ref<Proposal[]>([])

const showTaskCreationModal = ref<boolean>(false)
const taskCreationRef = ref<FormInst | null>(null)
const taskCreationModel = ref<{ title: string, description: string, reward: number | null, deadline: number | null }>({
  title: "",
  description: "",
  reward: null,
  deadline: null
})

const activeTasks = ref<Task[]>([])

const showActiveTasks = ref<boolean>(false)

const showReviewModal = ref<boolean>(false)

const proposalModel = ref<{ title: string, body: string }>({
  title: "",
  body: "",
})

const reviewFormRef = ref<FormInst | null>(null)

const reviewModel = ref<{ rating: number, comment: string }>({
  rating: 0,
  comment: ""
})

function openProposal(taskId: string, button: ButtonTypes) {
  if (button !== "accept") return
  selectedTaskId.value = taskId
  proposalModel.value = {
    title: "",
    body: "",
  }
  showModal.value = true
}

function closeProposal() {
  if (loading.value) return
  showModal.value = false
  selectedTaskId.value = null
}

function openDrawer() {
  showDrawer.value = true
}

const reviewFormRules: FormRules = {
  rating: [
    {
      validator: (_, value: number) => {
        if (!value || value < 1) {
          return new Error("Please select a rating")
        }
        return true
      },
      trigger: ["change"]
    }
  ],
  comment: [
    {
      validator: (_, value: string) => {
        if (value.length > 1000) {
          return new Error("Comment must be under 1000 characters")
        }
        return true
      },
      trigger: ["blur"]
    }
  ]
}

const taskFormRules: FormRules = {
  title: [
    { required: true, message: "Title is required", trigger: "blur" },
    {
      validator: (_, value: string) => {
        if (!value) return true
        if (value.trim().length < 1) return new Error("Title must be at least 1 characters")
        if (value.trim().length > 100) return new Error("Title must be at most 100 characters")
        return true
      },
      trigger: ["blur", "input"]
    }
  ],
  description: [
    {
      validator: (_, value: string) => {
        if (value.trim().length > 2000) return new Error("Description must be at most 2000 characters")
        return true
      }, trigger: "blur"
    }
  ],
  reward: [
    {
      validator: (_, value: number | null) => {
        if (value === null || value === undefined) {
          return new Error("Reward is required")
        }
        if (value < 0) {
          return new Error("Reward cannot be negative")
        }
        return true
      },
      trigger: ["blur", "change", "input"]
    }
  ],
  deadline: [
    {
      validator(_: unknown, value: number | null) {
        if (!value) return new Error("Deadline is required")

        if (value <= Date.now()) {
          return new Error("Deadline must be in the future")
        }

        return true
      },
      trigger: ["change", "blur"]
    }
  ]
}


const rules: FormRules = {
  title: [
    { required: true, message: "Title is required", trigger: "blur" },
    {
      validator: (_, value: string) => {
        if (!value) return true
        if (value.trim().length < 1) return new Error("Title must be at least 1 character")
        if (value.trim().length > 200) return new Error("Title must be at most 200 characters")
        return true
      },
      trigger: ["blur", "input"]
    }
  ],
  body: [
    { required: true, message: "Body is required", trigger: "blur" },
    {
      validator: (_, value: string) => {
        if (!value) return true
        if (value.trim().length < 10) return new Error("Body must be at least 10 characters")
        return true
      },
      trigger: ["blur", "input"]
    }
  ]
}

async function submitProposal() {
  if (!formRef.value || !selectedTaskId.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await api.post(`/tasks/${selectedTaskId.value}/proposals`, {
      title: proposalModel.value.title.trim(),
      body: proposalModel.value.body.trim()
    })

    message.success("Proposal sent")
  } catch (err) {
    message.error(err instanceof Error ? err.message : "Failed to send proposal")
  } finally {
    loading.value = false
    closeProposal()
  }
}

async function loadMyTasks() {
  try {
    const res: { ok: true, tasks: Omit<Task, "owner">[] } = await api.get("/tasks/me")
    if (myTasks.value.length === 0) {
      myTasks.value = myTasks.value.concat(res.tasks)
    } else {
      myTasks.value = res.tasks
    }
  } catch (err) {
    message.error("Failed to fetch tasks")
  }
}

async function loadActiveTasks() {
  try {
    const res: { ok: true, tasks: Task[] } = await api.get("/tasks/assigned/me")
    if (activeTasks.value.length === 0) {
      activeTasks.value = activeTasks.value.concat(res.tasks)
    } else {
      activeTasks.value = res.tasks
    }
  } catch (err) {
    message.error("Failed to fetch active tasks")
  }
}


async function loadTasks(sort: "newest" | "reward_desc" | "deadline_soon", limit: number, cursor?: string) {

  try {
    const path = withQuery("/tasks", { sort_by: sort, limit: `${limit}`, cursor })
    const res: { ok: true, tasks: Task[], nextCursor: string | null, hasNextPage: boolean } | { ok: false, message: string } = await api.get(path)
    if (res.ok) {
      tasks.value = tasks.value.concat(res.tasks)
      if (res.hasNextPage) {
        currentCursor.value = res.nextCursor
      } else {
        currentCursor.value = null
      }
    }
    // message.success("Successfully fetched tasks")
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Request failed"
    message.error(msg)
  }
}
onMounted(async () => {
  await loadTasks(currentSort.value, 50)
  await loadMyTasks()
  await loadActiveTasks()
})


async function handleLoad() {
  if (!currentCursor.value && tasks.value?.length !== 0) {
    return message.info("No more available tasks")
  }
  await loadTasks(currentSort.value, 50, currentCursor.value ?? undefined)
}

watch(currentSort, async (newValue, _) => {

  tasks.value = []
  currentCursor.value = null
  await loadTasks(newValue, 50)
})

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function handleTaskClick(taskId: string) {
  if (myTasks.value.find((e) => e.id === taskId)!.status !== "OPEN") {
    message.info("Task is not open")
    return
  }
  drawerSelectedTaskId.value = taskId
  drawerContent.value = "Proposals"
  const res = await api.get<{ ok: boolean, proposals: Proposal[] }>(`/tasks/${taskId}/proposals`)
  proposalsToShow.value = proposalsToShow.value.concat(res.proposals)
}

function handleActiveTaskClick(taskId: string, button: ButtonTypes) {
  if (activeTasks.value.find((e) => e.status !== "ASSIGNED") && button !== 'submit') return
  dialog.create({
    title: "Confirm Submission",
    content: "Are you sure?",
    positiveText: "Confirm",
    negativeText: "Cancel",
    onPositiveClick: () => handleActiveTaskSubmit(taskId),
    onNegativeClick: dialog.destroyAll
  })
}

function onProposalBack() {
  drawerContent.value = "Tasks"
  proposalsToShow.value = []
}

async function handleActiveTaskSubmit(taskId: string) {
  try {
    const res = await api.post<{ ok: true, message: string, task: Pick<Task, "id" | "status"> }>(`/tasks/${taskId}/submit`)
    activeTasks.value = activeTasks.value.map((e) => {
      if (e.id !== res.task.id) return e
      const newTask = e
      newTask.status = res.task.status
      return newTask
    })
    message.success("Submission Success")
  } catch (err) {
    message.error("Submission Failed")
  }
}

async function handleAssign(userId: string) {
  try {
    const res = await api.post<{
      ok: true, message: string, task: Pick<Task, "id" | "ownerId" | "status"> & {
        taskerId: string;
        updatedAt: Date;
      }
    }>(`/tasks/${drawerSelectedTaskId.value}/assign`, { userId })

    myTasks.value = myTasks.value.map((e) => {
      if (e.id !== drawerSelectedTaskId.value) return e
      const newTask = e
      newTask.status = res.task.status
      return newTask
    })
    message.success("Assignment Success")
  } catch (err) {
    message.error("Assignment Failed")
  } finally {
    drawerSelectedTaskId.value = null
    drawerContent.value = "Tasks"
    proposalsToShow.value = []
  }
}

const reviewTaskId = ref<string | null>(null)
function handleTaskConfirm(taskId: string, button: ButtonTypes) {
  if (button !== 'confirm') return
  showReviewModal.value = true
  reviewTaskId.value = taskId
}
async function handleReviewConfirm() {
  const taskId = reviewTaskId.value
  if (!taskId) {
    return
  }
  if (!reviewFormRef.value) return
  try {
    await reviewFormRef.value.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    const res = await api.post<{ ok: true, task: Pick<Task, "status"> }>(`/tasks/${taskId}/confirm`)
    myTasks.value = myTasks.value.map((e) => {
      if (e.id !== drawerSelectedTaskId.value) return e
      const newTask = e
      newTask.status = res.task.status
      return newTask
    })
    message.success("Confirmed Task Completion")
    await submitReview(taskId)
  } catch (err) {
    message.error("Operation Failed")
  } finally {
    reviewTaskId.value = null
    loading.value = false
    showReviewModal.value = false
  }

}

async function submitReview(taskId: string) {
  if (!reviewFormRef.value) return
  try {
    await reviewFormRef.value.validate()
  } catch {
    return
  }
  await api.post<{ ok: true }>(`/tasks/${taskId}/review`, { stars: reviewModel.value.rating, comment: reviewModel.value.comment })
  await loadMyTasks()
  message.success("Review Successful")
}

function handleTaskConfirmCancel() {
  showReviewModal.value = false
  reviewModel.value.rating = 0
  reviewModel.value.comment = ""
}

function disablePastDates(ts: number) {
  return ts < Date.now() - 24 * 60 * 60 * 1000
}

function openTaskModal() {
  showTaskCreationModal.value = true
}

function handleTaskCreationCancel() {
  taskCreationModel.value = {
    title: "",
    description: "",
    reward: null,
    deadline: null
  }
  showTaskCreationModal.value = false
}

async function submitTask() {
  if (!taskCreationRef.value) return
  try {
    await taskCreationRef.value.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    const res = await api.post<{ ok: boolean, message: string }>("/tasks", {
      title: taskCreationModel.value.title.trim(),
      description: taskCreationModel.value.description.trim() || undefined,
      reward: taskCreationModel.value.reward ?? 0,
      deadline: new Date(taskCreationModel.value.deadline!)
    })
    if (res.ok) {
      message.success("Task Created")
      await loadMyTasks()
    }
  } catch (err) {
    message.error("Task Creation Failes")
  } finally {
    loading.value = false
    showTaskCreationModal.value = false
  }

}

function openActiveTasksDrawer() {
  showActiveTasks.value = true
}

async function logout() {
  await api.post("/auth/logout")
  props.removeUser()
  message.success("Logout Successful")
  router.push("/")
}
</script>

<template>
  <n-flex style="padding-top: 24px;" vertical align="center" :size="24">
    <n-grid cols="3" class="grid">
      <n-gi>
        <div class="left">
          <n-button type="primary" @click="openDrawer">
            <n-icon :size="20" style="margin-right: 6px;">
              <User />
            </n-icon>
            {{ user!.username }}
          </n-button>
          <n-button tertiary type="primary" @click="openActiveTasksDrawer">
            Active Tasks
          </n-button>
        </div>
      </n-gi>
      <n-gi>
        <div class="center">
          <n-radio-group v-model:value="currentSort" name="sortGroup">
            <n-radio-button key="newest" value="newest" label="Newest" />
            <n-radio-button key="reward_desc" value="reward_desc" label="Reward" />
            <n-radio-button key="deadline_soon" value="deadline_soon" label="Deadline" />
          </n-radio-group>
        </div>
      </n-gi>
      <n-gi>
        <div class="right">
          <n-button type="primary" @click="openTaskModal">
            <n-icon :size="15" style="margin-right: 6px;">
              <Plus />
            </n-icon>
            Create Task
          </n-button>
        </div>
      </n-gi>
    </n-grid>
    <n-infinite-scroll style="height: 90vh; width: 100vw;" @load="handleLoad" :distance="200">
      <n-flex vertical :size="24" align="center">
        <Task v-for="task in tasks" :key="task.id" :task="task" @button-click="openProposal" button="accept" />
      </n-flex>
    </n-infinite-scroll>
  </n-flex>

  <n-modal v-model:show="showModal" preset="card" title="Send Proposal" :mask-closable="!loading"
    style="width: min(560px, 92vw)">
    <n-form ref="formRef" :model="proposalModel" :rules="rules" label-placement="top">
      <n-form-item label="Title" path="title">
        <n-input v-model:value="proposalModel.title" placeholder="Short proposal title" maxlength="100" show-count />
      </n-form-item>

      <n-form-item label="Body" path="body">
        <n-input v-model:value="proposalModel.body" type="textarea" placeholder="Explain your proposal"
          :autosize="{ minRows: 4, maxRows: 8 }" maxlength="1000" show-count />
      </n-form-item>
    </n-form>

    <template #footer>
      <div class="footer">
        <n-button :disabled="loading" @click="closeProposal">
          Cancel
        </n-button>
        <n-button type="primary" :loading="loading" @click="submitProposal">
          Submit Proposal
        </n-button>
      </div>
    </template>
  </n-modal>
  <n-modal v-model:show="showTaskCreationModal" preset="card" title="Create Task" style="width: min(560px, 92vw)">
    <n-form ref="taskCreationRef" :model="taskCreationModel" :rules="taskFormRules" label-placement="top">
      <n-space vertical size="large" style="width: 100%;">
        <n-form-item label="Title" path="title">
          <n-input v-model:value="taskCreationModel.title" placeholder="Enter task title" clearable />
        </n-form-item>

        <n-form-item label="Description" path="description">
          <n-input v-model:value="taskCreationModel.description" type="textarea" placeholder="Describe the task"
            :autosize="{ minRows: 4, maxRows: 8 }" clearable />
        </n-form-item>

        <n-grid :cols="2" :x-gap="12" responsive="screen">
          <n-form-item-gi label="Reward (₱)" path="reward">
            <n-input-number v-model:value="taskCreationModel.reward" placeholder="Enter reward amount" :min="0"
              style="width: 100%;" />
          </n-form-item-gi>

          <n-form-item-gi label="Deadline" path="deadline">
            <n-date-picker v-model:value="taskCreationModel.deadline" type="datetime" placeholder="Select deadline"
              clearable style="width: 100%;" :is-date-disabled="disablePastDates" />
          </n-form-item-gi>
        </n-grid>
        <n-form-item>
          <n-space justify="end" style="width:100%">
            <n-button @click="handleTaskCreationCancel">
              Cancel
            </n-button>

            <n-button type="primary" @click="submitTask">
              Submit Task
            </n-button>
          </n-space>
        </n-form-item>
      </n-space>

    </n-form>
  </n-modal>
  <!-- Main Drawer -->
  <n-drawer v-model:show="showDrawer" :width="800" placement="left">
    <n-drawer-content closable footer-style="justify-content: flex-start">
      <template v-slot:header>
        <div class="header" style="display: flex; flex-direction: column; gap: 8px;">
          <n-text type="primary" style="display: flex; align-items: center; gap: 6px;">
            <n-icon :size="30">
              <User />
            </n-icon>
            {{ capitalizeFirstLetter(user!.firstName) + " " + capitalizeFirstLetter(user!.lastName) }}
            <n-rate readonly allow-half :value="user!.ratingAvg" />
            <n-text depth="3">
              {{ user!.ratingAvg }} ({{ user!.ratingCount }})
            </n-text>
          </n-text>
          <n-text depth="3" style="font-size: small;">
            @{{ user!.username }}
          </n-text>
          <n-text depth="3" style="font-size: small;">
            {{ user!.email }}
          </n-text>
        </div>
      </template>
      <div class="drawer-body">
        <div class="body-header">
          <n-button v-if="drawerContent === 'Proposals'" style="grid-column: 1 / span 1; justify-self: start;"
            @click="onProposalBack">
            <n-icon>
              <ArrowLeft />
            </n-icon>
          </n-button>
          <n-h2 v-if="drawerContent === 'Tasks'">
            My Tasks
          </n-h2>
          <n-h2 v-if="drawerContent === 'Proposals'">
            Proposals
          </n-h2>
        </div>
        <Task v-if="drawerContent === 'Tasks'" v-for="task in myTasks" :key="task.id" :task="task"
          :clickable="task.status === 'OPEN'" @clicked="handleTaskClick"
          :button="task.status === 'SUBMITTED' ? 'confirm' : undefined" @button-click="handleTaskConfirm" />
        <Proposal v-if="drawerContent === 'Proposals'" v-for="proposal in proposalsToShow" :key="proposal.userId"
          :proposal="proposal" @assign="handleAssign" />
      </div>
      <template v-slot:footer>
        <n-button @click="logout">
          logout
        </n-button>
      </template>
    </n-drawer-content>
  </n-drawer>
  <!-- Active Task Drawer -->
  <n-drawer v-model:show="showActiveTasks" :width="800" placement="left">
    <n-drawer-content closable>
      <template v-slot:header>
        <div class="header" style="display: flex; justify-content: center;">
          <n-text>Active Tasks</n-text>
        </div>
      </template>
      <Task v-for="task in activeTasks" :key="task.id" :task="task"
        :button="task.status === 'ASSIGNED' ? 'submit' : undefined" @button-click="handleActiveTaskClick" />
    </n-drawer-content>
  </n-drawer>
  <n-modal v-model:show="showReviewModal">
    <n-card title="Leave a Rating" style="width: 450px" :bordered="false">
      <n-form ref="reviewFormRef" :model="reviewModel" :rules="reviewFormRules" label-placement="top">
        <!-- Stars -->
        <n-form-item label="Rating" path="rating">
          <n-rate v-model:value="reviewModel.rating" size="large" />
        </n-form-item>

        <!-- Comment -->
        <n-form-item label="Comment" path="comment">
          <n-input v-model:value="reviewModel.comment" type="textarea" placeholder="Write a comment (optional)"
            :autosize="{ minRows: 3, maxRows: 6 }" />
        </n-form-item>

        <!-- Buttons -->
        <n-space justify="end">
          <n-button :disabled="loading" @click="handleTaskConfirmCancel">
            Cancel
          </n-button>

          <n-button type="primary" @click="handleReviewConfirm" :loading="loading">
            Submit Rating
          </n-button>
        </n-space>

      </n-form>
    </n-card>
  </n-modal>
</template>

<style scoped>
.left,
.right,
.center {
  display: flex;
}

.left {
  justify-content: flex-start;
  gap: 12px;
}

.right {
  justify-content: flex-end;
}

.center {
  justify-content: center;
}

.grid {
  padding: 0 50px;
}

.drawer-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.body-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: start;
  justify-content: start;
  width: 100%;
}

.body-header .n-h2 {
  justify-self: center;
  grid-column: 2 / span 1;
}
</style>