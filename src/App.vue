<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuth } from './composables/useAuth';
import Sonner from './components/ui/sonner/Sonner.vue';

const auth = useAuth()

onMounted(() => {
  void auth.init()
})
</script>

<template>
  <Sonner />
  <RouterView v-if="auth.ready.value" />
</template>
