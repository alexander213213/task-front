<script setup lang="ts">
import { Star } from "@vicons/fa"
import { useDialog } from "naive-ui";

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

const dialog = useDialog()
const props = defineProps<{
    proposal: Proposal
}>()

const emits = defineEmits<{
    assign: [userId: string]
}>()
function formatDate(date: Date) {
    return new Date(date).toLocaleDateString()
}

function handleAssign() {
    emits("assign", props.proposal.userId)
}

function confirmAssign() {
    dialog.create({
        title: "Confirm Assignment",
        content: "Are you sure?",
        positiveText: "Confirm",
        negativeText: "Cancel",
        onPositiveClick: handleAssign,
        onNegativeClick: dialog.destroyAll
    })
}
</script>

<template>
    <n-card hoverable>
        <div class="header">
            <div class="title">
                <n-text strong>
                    {{ proposal.title }}
                </n-text>
                <n-text depth="3">
                    by {{ proposal.user.username }} • {{ formatDate(proposal.createdAt) }}
                </n-text>
            </div>

            <div class="rating">
                <n-icon color="#c8a735">
                    <Star />
                </n-icon>
                <n-text>
                    {{ proposal.user.ratingAvg.toFixed(1) }} ({{ proposal.user.ratingCount }})
                </n-text>
            </div>
        </div>

        <div class="body">
            <n-text>
                {{ proposal.body }}
            </n-text>
        </div>

        <div class="action">
            <n-button type="primary" @click="confirmAssign">
                Assign
            </n-button>
        </div>

    </n-card>
</template>

<style scoped>
.header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    width: 100%;

    padding-bottom: 24px;
}

.title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    font-size: 1.05rem;
    line-height: 1.2;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    gap: 12px;
}
.rating {
    display: flex;
    align-items: center;
    gap: 6px;
}

.action {
    display: flex;
    justify-content: flex-end;
    padding-top: 12px;
}
</style>