import { describe, expect, it, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import MyTasksView from "@/pages/MyTasksView.vue";
import type { Task } from "@/services/types";

vi.mock("@/services/resources/tasks", () => ({
  tasksApi: {
    mine: vi.fn(),
    create: vi.fn(),
    patch: vi.fn(),
    remove: vi.fn(),
    cancel: vi.fn(),
    unassign: vi.fn(),
    confirm: vi.fn(),
    review: vi.fn(),
  },
  proposalsApi: { create: vi.fn() },
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useRoute: () => ({ params: {}, query: {} }),
}));

vi.mock("vue-sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { tasksApi } from "@/services/resources/tasks";

const mockTasksApi = vi.mocked(tasksApi);

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "My open job",
    description: null,
    reward: 120,
    deadline: new Date(Date.now() + 86_400_000),
    createdAt: new Date(),
    ownerId: "u1",
    status: "OPEN",
    ...overrides,
  };
}

describe("MyTasksView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTasksApi.mine.mockResolvedValue({ tasks: [task()], nextCursor: null, hasNextPage: false });
  });

  function mountView() {
    return mount(MyTasksView, { global: { stubs: { AppHeader: true } } });
  }

  it("lists posted tasks with status actions", async () => {
    const wrapper = mountView();
    await flushPromises();

    expect(mockTasksApi.mine).toHaveBeenCalledWith({ limit: 12, cursor: undefined, status: undefined });
    expect(wrapper.text()).toContain("My open job");
    expect(wrapper.text()).toContain("Edit");
    expect(wrapper.text()).toContain("Delete");
  });

  it("filters by status", async () => {
    const wrapper = mountView();
    await flushPromises();

    const buttons = wrapper.findAll("button").filter((b) => b.text() === "Completed");
    expect(buttons).toHaveLength(1);
    await buttons[0]!.trigger("click");
    await flushPromises();

    expect(mockTasksApi.mine).toHaveBeenLastCalledWith({ limit: 12, cursor: undefined, status: "COMPLETED" });
  });

  it("deletes through the confirm dialog and reloads", async () => {
    const wrapper = mountView();
    await flushPromises();
    mockTasksApi.remove.mockResolvedValue({ task: task() });

    const deleteBtn = wrapper.findAll("button").find((b) => b.text() === "Delete");
    expect(deleteBtn).toBeTruthy();
    await deleteBtn!.trigger("click");
    await flushPromises();

    // Reka renders dialog content in a portal on document.body.
    expect(document.body.textContent).toContain("Delete task?");
    const dialogConfirm = [...document.querySelectorAll("button")].filter(
      (b) => b.textContent === "Delete" && !wrapper.element.contains(b)
    );
    expect(dialogConfirm).toHaveLength(1);
    (dialogConfirm[0] as HTMLButtonElement).click();
    await flushPromises();

    expect(mockTasksApi.remove).toHaveBeenCalledWith("t1");
  });
});
