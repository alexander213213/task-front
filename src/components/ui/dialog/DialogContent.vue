<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogPortal } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { X } from "lucide-vue-next";
import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <DialogPortal>
    <DialogOverlay class="fixed inset-0 z-50 bg-black/70" />
    <DialogContent
      :class="cn('fixed left-1/2 top-1/2 z-50 grid w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-card p-6 text-card-foreground', props.class)"
    >
      <slot />
      <DialogClose
        class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Close"
      >
        <X class="h-4 w-4" />
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
