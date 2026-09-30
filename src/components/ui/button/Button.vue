<script setup lang="ts">
import { buttonClass, type ButtonProps } from "./index";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ButtonProps & { type?: "button" | "submit" | "reset"; disabled?: boolean; loading?: boolean }>(), {
  type: "button",
});
</script>

<template>
  <button :type="props.type" :disabled="props.disabled || props.loading" :class="buttonClass(props)" v-bind="$attrs">
    <slot />
  </button>
</template>
