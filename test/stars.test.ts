import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import StarsInput from "@/components/StarsInput.vue";

describe("StarsInput", () => {
  it("renders five stars and emits the chosen value", async () => {
    const wrapper = mount(StarsInput, { props: { modelValue: 0 } });
    const buttons = wrapper.findAll("button");
    expect(buttons).toHaveLength(5);

    await buttons[2]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([[3]]);
  });

  it("ignores clicks when disabled", async () => {
    const wrapper = mount(StarsInput, { props: { modelValue: 4, disabled: true } });
    await wrapper.findAll("button")[0]!.trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });
});
