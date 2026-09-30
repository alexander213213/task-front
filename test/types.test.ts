import { describe, expect, it } from "vitest";
import { normalizeProposal, normalizeTask, rewardToNumber } from "@/services/types";
import { withQuery } from "@/utils/query";

describe("types", () => {
  it("converts Decimal-as-string rewards to numbers", () => {
    expect(rewardToNumber("250")).toBe(250);
    expect(rewardToNumber(250)).toBe(250);
    expect(rewardToNumber("garbage")).toBe(0);
  });

  it("normalizes task dates and rewards", () => {
    const task = normalizeTask({
      id: "1",
      title: "Job",
      description: null,
      reward: "199.5",
      deadline: "2026-12-01T00:00:00.000Z",
      createdAt: "2026-09-01T00:00:00.000Z",
      ownerId: "u1",
      status: "OPEN",
    });
    expect(task.reward).toBe(199.5);
    expect(task.deadline).toBeInstanceOf(Date);
    expect(task.createdAt.getFullYear()).toBe(2026);
  });

  it("normalizes proposal dates", () => {
    const proposal = normalizeProposal({
      taskId: "t",
      userId: "u",
      title: "Bid",
      body: "Body",
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-02T00:00:00.000Z",
    });
    expect(proposal.createdAt).toBeInstanceOf(Date);
  });
});

describe("withQuery", () => {
  it("skips empty values and encodes the rest", () => {
    expect(withQuery("/tasks", { sort_by: "newest", limit: "20", cursor: undefined, q: "  " })).toBe(
      "/tasks?sort_by=newest&limit=20"
    );
    expect(withQuery("/tasks", {})).toBe("/tasks");
  });
});
