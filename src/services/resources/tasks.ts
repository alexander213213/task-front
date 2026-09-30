import { api } from "../api";
import { withQuery } from "../../utils/query";
import {
  normalizeProposal,
  normalizeTask,
  type Page,
  type Proposal,
  type Review,
  type Task,
  type TaskDetail,
  type TaskSort,
  type TaskStatus,
} from "../types";

export interface FeedParams {
  sort?: TaskSort;
  limit?: number;
  cursor?: string;
  q?: string;
  minReward?: number;
  maxReward?: number;
  deadlineFrom?: string;
  deadlineTo?: string;
}

export interface MyTasksParams {
  limit?: number;
  cursor?: string;
  status?: TaskStatus;
}

function toParams(params: FeedParams | MyTasksParams): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && `${v}`.trim() !== "") out[k] = `${v}`;
  }
  return out;
}

export const tasksApi = {
  async create(payload: { title: string; description?: string; reward: number; deadline: string }): Promise<{ task: Task }> {
    const res = await api.post<{ task: Parameters<typeof normalizeTask>[0] }>("/tasks", {
      title: payload.title,
      ...(payload.description ? { description: payload.description } : {}),
      reward: payload.reward,
      deadline: payload.deadline,
    });
    return { task: normalizeTask(res.task) };
  },

  async feed(params: FeedParams = {}): Promise<Page<Task>> {
    const res = await api.get<{ tasks: Parameters<typeof normalizeTask>[0][]; nextCursor: string | null; hasNextPage: boolean }>(
      withQuery("/tasks", { sort_by: params.sort ?? "newest", ...toParams({ ...params, sort: undefined }) })
    );
    return { tasks: res.tasks.map(normalizeTask), nextCursor: res.nextCursor, hasNextPage: res.hasNextPage };
  },

  async mine(params: MyTasksParams = {}): Promise<Page<Task>> {
    const res = await api.get<{ tasks: Parameters<typeof normalizeTask>[0][]; nextCursor: string | null; hasNextPage: boolean }>(
      withQuery("/tasks/me", toParams(params))
    );
    return { tasks: res.tasks.map(normalizeTask), nextCursor: res.nextCursor, hasNextPage: res.hasNextPage };
  },

  async assigned(params: MyTasksParams = {}): Promise<Page<Task>> {
    const res = await api.get<{ tasks: Parameters<typeof normalizeTask>[0][]; nextCursor: string | null; hasNextPage: boolean }>(
      withQuery("/tasks/assigned/me", toParams(params))
    );
    return { tasks: res.tasks.map(normalizeTask), nextCursor: res.nextCursor, hasNextPage: res.hasNextPage };
  },

  async detail(id: string): Promise<{ task: TaskDetail }> {
    const res = await api.get<{
      task: Parameters<typeof normalizeTask>[0] & {
        review: { stars: number; comment: string; createdAt: string } | null;
        _count: { proposals: number };
        myProposal: { title: string; body: string; createdAt: string } | null;
      };
    }>(`/tasks/${id}`);
    const { _count, review, myProposal, ...rest } = res.task;
    return {
      task: {
        ...normalizeTask(rest),
        review: review ? { ...review, createdAt: new Date(review.createdAt) } : null,
        proposalCount: _count.proposals,
        myProposal: myProposal ? { ...myProposal, createdAt: new Date(myProposal.createdAt) } : null,
      },
    };
  },

  patch(id: string, op: Record<string, unknown>): Promise<{ task: Task }> {
    return api.patch<{ task: Parameters<typeof normalizeTask>[0] }>(`/tasks/${id}`, op).then((res) => ({
      task: normalizeTask(res.task),
    }));
  },

  remove(id: string): Promise<{ task: Task }> {
    return api.del<{ task: Parameters<typeof normalizeTask>[0] }>(`/tasks/${id}`).then((res) => ({
      task: normalizeTask(res.task),
    }));
  },

  assign(id: string, userId: string): Promise<{ task: Pick<Task, "id" | "status"> }> {
    return api.post(`/tasks/${id}/assign`, { userId });
  },
  submit(id: string): Promise<{ task: Pick<Task, "id" | "status"> }> {
    return api.post(`/tasks/${id}/submit`);
  },
  confirm(id: string): Promise<{ task: Pick<Task, "id" | "status"> }> {
    return api.post(`/tasks/${id}/confirm`);
  },
  cancel(id: string): Promise<{ task: Pick<Task, "id" | "status"> }> {
    return api.post(`/tasks/${id}/cancel`);
  },
  unassign(id: string): Promise<{ task: Pick<Task, "id" | "status"> }> {
    return api.post(`/tasks/${id}/unassign`);
  },

  review(id: string, stars: number, comment: string): Promise<{ tasker: { id: string; username: string; ratingAvg: number; ratingCount: number } }> {
    return api.post(`/tasks/${id}/review`, { stars, comment });
  },

  async getReview(id: string): Promise<{ review: Review | null }> {
    const res = await api.get<{ review: (Omit<Review, "createdAt"> & { createdAt: string }) | null }>(
      `/tasks/${id}/review`
    );
    return { review: res.review ? { ...res.review, createdAt: new Date(res.review.createdAt) } : null };
  },
};

export const proposalsApi = {
  create(taskId: string, title: string, body: string): Promise<{ proposal: Proposal }> {
    return api
      .post<{ proposal: Parameters<typeof normalizeProposal>[0] }>(`/tasks/${taskId}/proposals`, { title, body })
      .then((res) => ({ proposal: normalizeProposal(res.proposal) }));
  },

  async list(taskId: string): Promise<{ proposals: Proposal[] }> {
    const res = await api.get<{ proposals: Parameters<typeof normalizeProposal>[0][] }>(
      `/tasks/${taskId}/proposals`
    );
    return { proposals: res.proposals.map(normalizeProposal) };
  },

  editMine(taskId: string, title: string, body: string): Promise<{ proposal: Proposal }> {
    return api
      .patch<{ proposal: Parameters<typeof normalizeProposal>[0] }>(`/tasks/${taskId}/proposals/me`, { title, body })
      .then((res) => ({ proposal: normalizeProposal(res.proposal) }));
  },

  withdrawMine(taskId: string): Promise<{ taskId: string }> {
    return api.del(`/tasks/${taskId}/proposals/me`);
  },
};
