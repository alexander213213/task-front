<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { AvatarFallback, AvatarImage, AvatarRoot } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<{
  src?: string;
  alt?: string;
  fallback?: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <AvatarRoot :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary', props.class)">
    <AvatarImage v-if="props.src" :src="props.src" :alt="props.alt" class="aspect-square h-full w-full" />
    <AvatarFallback class="flex h-full w-full items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
      {{ props.fallback ?? props.alt?.slice(0, 2).toUpperCase() ?? "?" }}
    </AvatarFallback>
  </AvatarRoot>
</template>
