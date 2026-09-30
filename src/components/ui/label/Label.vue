<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Label as RekaLabel } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"]; for?: string }>();
</script>

<template>
  <RekaLabel :for="props.for" :class="cn('text-sm font-medium leading-none text-foreground', props.class)">
    <slot />
  </RekaLabel>
</template>
