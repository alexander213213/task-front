/** Domain types mirroring the API contract. Raw JSON uses ISO strings and
 *  Decimal-as-string rewards; normalize*() converts to UI-friendly values. */

export type TaskStatus = "OPEN" | "ASSIGNED" | "SUBMITTED" | "COMPLETED" | "CANCELLED";
export type TaskSort = "newest" | "reward_desc" | "deadline_soon";

export interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  ratingAvg: number;
  ratingCount: number;
}

export interface TaskOwner {
  username: string;
}

export interface TaskTasker {
  username: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  /** Normalized to a number by normalizeTask (API sends Decimal-as-string). */
  reward: number;
  deadline: Date;
  createdAt: Date;
  updatedAt?: Date;
  ownerId: string;
  status: TaskStatus;
  owner?: TaskOwner;
  tasker?: TaskTasker;
}

export interface TaskDetail extends Task {
  review: { stars: number; comment: string; createdAt: Date } | null;
  proposalCount: number;
  myProposal: { title: string; body: string; createdAt: Date } | null;
}

export interface Proposal {
  taskId: string;
  userId: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  user?: { username: string; ratingAvg: number; ratingCount: number };
}

export interface Review {
  id: string;
  stars: number;
  comment: string;
  createdAt: Date;
  reviewerId: string;
  revieweeId: string;
}

export interface Page<T> {
  tasks: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export function rewardToNumber(reward: unknown): number {
  const n = typeof reward === "string" ? Number(reward) : (reward as number);
  return Number.isFinite(n) ? n : 0;
}

interface RawTask {
  id: string;
  title: string;
  description: string | null;
  reward: unknown;
  deadline: string;
  createdAt: string;
  updatedAt?: string;
  ownerId: string;
  status: TaskStatus;
  owner?: TaskOwner;
  tasker?: TaskTasker;
}

export function normalizeTask(raw: RawTask): Task {
  return {
    ...raw,
    reward: rewardToNumber(raw.reward),
    deadline: new Date(raw.deadline),
    createdAt: new Date(raw.createdAt),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : undefined,
  };
}

export function normalizeProposal(raw: {
  taskId: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  user?: Proposal["user"];
}): Proposal {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}
