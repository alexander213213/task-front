<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import type { Task } from "../pages/Tasks.vue";


export type ButtonTypes = "accept" | "assign" | "submit" | "confirm" | "review" | undefined
const props = defineProps<{
  task: Task | Omit<Task, "owner">,
  button?: ButtonTypes
  clickable?: boolean
}>()


const emit = defineEmits<{
  buttonClick: [taskId: string, button: ButtonTypes]
  clicked: [taskId: string]
}>()


const now = ref(Date.now())
let t: number | undefined

onMounted(() => {
  t = window.setInterval(() => (now.value = Date.now()), 10000)
})
onUnmounted(() => {
  if (t) window.clearInterval(t)
})

const deadlineMs = computed(() => new Date(props.task.deadline).getTime())


const formattedReward = computed(() => `₱${props.task.reward.toLocaleString()}`)
const formattedDeadline = computed(() => new Date(props.task.deadline).toLocaleString())
const formattedCreated = computed(() => new Date(props.task.createdAt).toLocaleDateString())



function formatDuration(ms: number) {
  if (ms <= 0) return "Expired"
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}
undefined
const timeRemainingText = computed(() => formatDuration(deadlineMs.value - now.value))

const statusType = computed(() => {
  switch (props.task.status) {
    case "OPEN":
      return "success"
    case "ASSIGNED":
      return "warning"
    case "SUBMITTED":
      return "info"
    case "COMPLETED":
      return "default"
    case "CANCELLED":
      return "error"
  }
})

const urgencyType = computed(() => {
  const msLeft = deadlineMs.value - now.value
  if (msLeft <= 0) return "error"
  if (msLeft <= 60 * 60 * 1000) return "warning" // <= 1 hour
  return "success"
})

function onButtonClick() {
  emit("buttonClick", props.task.id, props.button)
}


const creationInfo = "owner" in props.task ? `by ${props.task.owner.username} • ${formattedCreated.value}` : `${formattedCreated.value}`


function onClick() {
  if (!props.clickable) return
  emit("clicked", props.task.id)
}
</script>

<template>
  <n-card hoverable class="task-card" :class="{clickable: props.clickable}" @click="onClick">
    <!-- Top row -->
    <div class="top">
      <div class="title-wrap">
        <n-text strong class="title">{{ task.title.trim() }}</n-text>
        
        <n-text depth="3" class="meta">{{ creationInfo }}</n-text>
      </div>

      <div class="tags">
        <n-tag size="small" :type="statusType">{{ task.status }}</n-tag>
        <n-tag size="small" :type="urgencyType">
          {{ timeRemainingText }}
        </n-tag>
      </div>
    </div>

    <!-- Description -->
    <p v-if="task.description" class="desc">
      {{ task.description }}
    </p>
    <n-text v-else depth="3" class="desc-empty">No description provided.</n-text>

    <n-divider />

    <!-- Bottom row -->
    <div class="bottom">
      <div class="kv">
        <div class="kv-row">
          <n-text depth="3">Reward</n-text>
          <n-text strong>{{ formattedReward }}</n-text>
        </div>
        <div class="kv-row">
          <n-text depth="3">Deadline</n-text>
          <n-text>{{ formattedDeadline }}</n-text>
        </div>
        <div v-if="task.tasker" class="kv-row">
          <n-text depth="3">Assigned to</n-text>
          <n-text type="primary">{{ task.tasker?.username }}</n-text>
        </div>
      </div>

      <div class="actions" v-if="button">
        
        <n-button
          v-if="button === 'accept'"
          type="primary"
          @click="onButtonClick"
        >
          Make Proposal
        </n-button>
        <n-button
          v-if="button === 'assign'"
          type="primary"
          @click="onButtonClick"
        >
          Assign
        </n-button>
        <n-button
          v-if="button === 'submit'"
          type="primary"
          @click="onButtonClick"
        >
          Submit
        </n-button>
        <n-button
          v-if="button === 'confirm'"
          type="primary"
          @click="onButtonClick"
        >
          Confirm Submission
        </n-button>
        <n-button
          v-if="button === 'review'"
          type="primary"
          @click="onButtonClick"
        >
          Review
        </n-button>

      </div>
    </div>

  </n-card>

</template>

<style scoped>
.task-card {
  width: min(100%, 50vw);
  cursor: default;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.task-card:hover {
  transform: translateY(-2px);
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 24px;
}

.title-wrap {
  display: grid;
  gap: 4px;
  min-width: 0;
  text-align: left;
}

.title {
  font-size: 1.05rem;
  line-height: 1.2;
  /* prevent long titles from breaking layout */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.meta {
  font-size: 0.9rem;
}

.tags {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.desc,
.desc-empty {
  margin: 12px 0 0;
  line-height: 1.45;
}

.desc {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: left;
}

.bottom {
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  flex-direction: column;
  gap: 16px;
  flex-wrap: wrap;
}

.kv {
  display: grid;
  gap: 8px;
  min-width: 240px;
  flex: 1;
}

.kv-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.actions {
  display: grid;
  gap: 6px;
  justify-items: end;
}

.hint {
  font-size: 0.85rem;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.clickable {
  cursor: pointer;
}
</style>