import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import TaskDetailView from "@/pages/TaskDetailView.vue";
import { useAuth } from "@/composables/useAuth";
import type { TaskDetail } from "@/services/types";

vi.mock("@/services/resources/tasks", () => ({
  tasksApi: { detail: vi.fn(), assign: vi.fn() },
  proposalsApi: { create: vi.fn(), editMine: vi.fn(), withdrawMine: vi.fn() },
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useRoute: () => ({ params: { id: "t1" }, query: {} }),
}));

vi.mock("vue-sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { proposalsApi, tasksApi } from "@/services/resources/tasks";

const mockTasks = vi.mocked(tasksApi);
const mockProposals = vi.mocked(proposalsApi);

const BIDDER = {
  id: "bidder1",
  username: "bidder1",
  email: "bidder@test.com",
  firstName: "Bid",
  lastName: "Der",
  middleName: null,
  ratingAvg: 0,
  ratingCount: 0,
};

function detail(): TaskDetail {
  return {
    id: "t1",
    title: "Detail job",
    description: "Do the thing.",
    reward: 200,
    deadline: new Date(Date.now() + 86_400_000),
    createdAt: new Date(),
    ownerId: "owner1",
    status: "OPEN",
    owner: { username: "owner1" },
    review: null,
    proposalCount: 1,
    myProposal: { title: "My bid", body: "Original body text", createdAt: new Date() },
  };
}

describe("TaskDetailView proposals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
    useAuth().resetForTests(BIDDER, true);
    mockTasks.detail.mockResolvedValue({ task: detail() });
  });

  function mountView() {
    const el = document.createElement("div");
    document.body.appendChild(el);
    return mount(TaskDetailView, {
      attachTo: el,
      global: { stubs: { AppHeader: true, ProposalsManager: true } },
    });
  }

  it("edits your proposal through the dialog", async () => {
    mockProposals.editMine.mockResolvedValue({
      proposal: {
        taskId: "t1",
        userId: "bidder1",
        title: "Edited bid",
        body: "Edited body text here",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.text()).toContain("My bid");
    const editBtn = wrapper.findAll("button").find((b) => b.text() === "Edit");
    expect(editBtn).toBeTruthy();
    await editBtn!.trigger("click");
    await flushPromises();

    expect(document.body.textContent).toContain("Edit proposal");
    const form = document.querySelector("form");
    expect(form).toBeTruthy();
    form!.dispatchEvent(new Event("submit", { cancelable: true }));
    await flushPromises();

    expect(mockProposals.editMine).toHaveBeenCalledWith("t1", "My bid", "Original body text");
    wrapper.unmount();
  });

  it("withdraws your proposal through confirm", async () => {
    mockProposals.withdrawMine.mockResolvedValue({ taskId: "t1" });
    const wrapper = mountView();
    await flushPromises();

    const withdrawBtn = wrapper.findAll("button").find((b) => b.text() === "Withdraw");
    expect(withdrawBtn).toBeTruthy();
    await withdrawBtn!.trigger("click");
    await flushPromises();

    expect(document.body.textContent).toContain("Withdraw proposal?");
    const confirm = [...document.querySelectorAll("button")].find(
      (b) => b.textContent === "Withdraw" && !wrapper.element.contains(b)
    );
    expect(confirm).toBeTruthy();
    (confirm as HTMLButtonElement).click();
    await flushPromises();

    expect(mockProposals.withdrawMine).toHaveBeenCalledWith("t1");
    wrapper.unmount();
  });
});
