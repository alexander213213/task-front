import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Landing from "@/pages/Landing.vue";

const push = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({ push, back: vi.fn() }),
  useRoute: () => ({ params: {}, query: {} }),
}));

describe("Landing", () => {
  it("renders the hero, workflow, and calls to action", () => {
    const wrapper = mount(Landing);
    const text = wrapper.text();

    expect(text).toContain("Task marketplace demo");
    expect(text).toContain("Core task flow");
    expect(text).toContain("Included in the current build");
    expect(wrapper.findAll("button").length).toBeGreaterThan(0);
  });

  it("navigates to login from the hero button", async () => {
    const wrapper = mount(Landing);
    const cta = wrapper.findAll("button").find((b) => b.text() === "Explore Demo");
    expect(cta).toBeTruthy();
    await cta!.trigger("click");
    expect(push).toHaveBeenCalledWith("/auth/login");
  });
});
