<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Separator as RekaSeparator } from "reka-ui";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{ class?: HTMLAttributes["class"]; orientation?: "horizontal" | "vertical"; decorative?: boolean }>(),
  { orientation: "horizontal", decorative: true }
);
</script>

<template>
  <RekaSeparator
    :orientation="props.orientation"
    :decorative="props.decorative"
    :class="cn('shrink-0 bg-border', props.orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', props.class)"
  />
</template>
