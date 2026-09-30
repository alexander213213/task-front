<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { badgeClass, type BadgeVariants } from "./index";

const props = defineProps<{ variant?: BadgeVariants["variant"]; class?: HTMLAttributes["class"] }>();
</script>

<template>
  <span :class="badgeClass(props.variant, props.class)">
    <slot />
  </span>
</template>
