import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TaskCard from "@/components/TaskCard.vue";
import type { Task } from "@/services/types";

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "Fix the sink",
    description: "Kitchen sink drains slowly.",
    reward: 250,
    deadline: new Date(Date.now() + 2 * 86_400_000),
    createdAt: new Date("2026-09-01T00:00:00.000Z"),
    ownerId: "u1",
    status: "OPEN",
    owner: { username: "owner1" },
    ...overrides,
  };
}

describe("TaskCard", () => {
  it("renders title, reward, status, and byline", () => {
    const wrapper = mount(TaskCard, { props: { task: task(), clickable: true } });
    const text = wrapper.text();

    expect(text).toContain("Fix the sink");
    expect(text).toContain("250");
    expect(text).toContain("OPEN");
    expect(text).toContain("owner1");
  });

  it("emits open only when clickable", async () => {
    const clickable = mount(TaskCard, { props: { task: task(), clickable: true } });
    await clickable.trigger("click");
    expect(clickable.emitted("open")).toEqual([["t1"]]);

    const plain = mount(TaskCard, { props: { task: task() } });
    await plain.trigger("click");
    expect(plain.emitted("open")).toBeUndefined();
  });

  it("shows the tasker when assigned", () => {
    const wrapper = mount(TaskCard, {
      props: { task: task({ status: "ASSIGNED", tasker: { username: "worker1" } }) },
    });
    expect(wrapper.text()).toContain("worker1");
  });

  it("renders the actions slot", () => {
    const wrapper = mount(TaskCard, {
      props: { task: task() },
      slots: { actions: "<button>Bid now</button>" },
    });
    expect(wrapper.text()).toContain("Bid now");
  });
});
