<script setup lang="ts">
import { useAttrs, type HTMLAttributes, type TextareaHTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

defineOptions({ inheritAttrs: false });

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
const model = defineModel<string | null>();
const attrs = useAttrs() as TextareaHTMLAttributes;
</script>

<template>
  <textarea
    v-model="model"
    :class="cn('flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50', props.class)"
    v-bind="attrs"
  />
</template>
