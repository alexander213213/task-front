import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import ProposalsManager from "@/components/ProposalsManager.vue";
import type { Proposal } from "@/services/types";

vi.mock("@/services/resources/tasks", () => ({
  proposalsApi: { list: vi.fn(), create: vi.fn(), editMine: vi.fn(), withdrawMine: vi.fn() },
  tasksApi: { assign: vi.fn() },
}));

vi.mock("vue-sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { proposalsApi, tasksApi } from "@/services/resources/tasks";

const mockProposals = vi.mocked(proposalsApi);
const mockTasks = vi.mocked(tasksApi);

function proposal(userId: string, username: string): Proposal {
  return {
    taskId: "t1",
    userId,
    title: `Bid from ${username}`,
    body: "Experienced and ready.",
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { username, ratingAvg: 4.5, ratingCount: 3 },
  };
}

describe("ProposalsManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProposals.list.mockResolvedValue({
      proposals: [proposal("u1", "worker1"), proposal("u2", "worker2")],
    });
  });

  it("lists proposals with ratings and assigns through confirm", async () => {
    mockTasks.assign.mockResolvedValue({ task: { id: "t1", status: "ASSIGNED" } });
    const wrapper = mount(ProposalsManager, {
      props: { taskId: "t1", taskStatus: "OPEN", assigneeUsername: null },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Proposals (2)");
    expect(wrapper.text()).toContain("worker1");
    expect(wrapper.text()).toContain("4.5");

    const assignBtn = wrapper.findAll("button").find((b) => b.text() === "Assign");
    expect(assignBtn).toBeTruthy();
    await assignBtn!.trigger("click");
    await flushPromises();

    expect(document.body.textContent).toContain("Assign this tasker?");
    const confirm = [...document.querySelectorAll("button")].find(
      (b) => b.textContent === "Assign" && !wrapper.element.contains(b)
    );
    expect(confirm).toBeTruthy();
    (confirm as HTMLButtonElement).click();
    await flushPromises();

    expect(mockTasks.assign).toHaveBeenCalledWith("t1", "u1");
    expect(wrapper.emitted("assigned")).toEqual([["t1"]]);
  });

  it("marks the assigned proposal and hides assign when closed", async () => {
    const wrapper = mount(ProposalsManager, {
      props: { taskId: "t1", taskStatus: "ASSIGNED", assigneeUsername: "worker2" },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Assigned");
    expect(wrapper.findAll("button").some((b) => b.text() === "Assign")).toBe(false);
  });

  it("shows an empty state and retries on error", async () => {
    mockProposals.list
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValueOnce({ proposals: [] });
    const wrapper = mount(ProposalsManager, {
      props: { taskId: "t1", taskStatus: "OPEN", assigneeUsername: null },
    });
    await flushPromises();
    expect(wrapper.text()).toContain("down");

    const retry = wrapper.findAll("button").find((b) => b.text() === "Retry");
    await retry!.trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("No proposals yet");
  });
});
