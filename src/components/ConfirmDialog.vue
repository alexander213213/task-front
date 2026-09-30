<script setup lang="ts">
import Button from "./ui/button/Button.vue";
import Dialog from "./ui/dialog/Dialog.vue";
import DialogContent from "./ui/dialog/DialogContent.vue";
import DialogDescription from "./ui/dialog/DialogDescription.vue";
import DialogFooter from "./ui/dialog/DialogFooter.vue";
import DialogTitle from "./ui/dialog/DialogTitle.vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    destructive?: boolean;
    busy?: boolean;
  }>(),
  { confirmLabel: "Confirm", destructive: false, busy: false }
);
const emit = defineEmits<{ "update:open": [value: boolean]; confirm: [] }>();
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <DialogTitle>{{ props.title }}</DialogTitle>
      <DialogDescription v-if="props.description">{{ props.description }}</DialogDescription>
      <DialogFooter>
        <Button type="button" variant="ghost" :disabled="props.busy" @click="emit('update:open', false)">
          Cancel
        </Button>
        <Button
          type="button"
          :variant="props.destructive ? 'destructive' : 'default'"
          :disabled="props.busy"
          @click="emit('confirm')"
        >
          {{ props.busy ? "Working..." : props.confirmLabel }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
