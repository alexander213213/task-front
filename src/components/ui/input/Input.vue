<script setup lang="ts">
import { useAttrs, type HTMLAttributes, type InputHTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

defineOptions({ inheritAttrs: false });

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
const model = defineModel<string | number | null>();
const attrs = useAttrs() as InputHTMLAttributes;
</script>

<template>
  <input
    v-model="model"
    :class="cn('flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', props.class)"
    v-bind="attrs"
  />
</template>
