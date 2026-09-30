<script setup lang="ts">
import { Star } from "lucide-vue-next";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{ modelValue: number; disabled?: boolean; size?: number }>(),
  { disabled: false, size: 24 }
);
const emit = defineEmits<{ "update:modelValue": [value: number] }>();

function choose(n: number): void {
  if (!props.disabled) emit("update:modelValue", n);
}
</script>

<template>
  <div class="flex items-center gap-1" role="radiogroup" aria-label="Rating">
    <button
      v-for="n in [1, 2, 3, 4, 5]"
      :key="n"
      type="button"
      :disabled="props.disabled"
      :aria-label="`${n} star${n === 1 ? '' : 's'}`"
      :class="cn('rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default', n <= props.modelValue ? 'text-primary' : 'text-muted-foreground')"
      @click="choose(n)"
    >
      <Star :size="props.size" :fill="n <= props.modelValue ? 'currentColor' : 'none'" />
    </button>
  </div>
</template>
