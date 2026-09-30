<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuth } from './composables/useAuth';
import Sonner from './components/ui/sonner/Sonner.vue';
import RealtimeHost from './components/RealtimeHost.vue';

const auth = useAuth()

onMounted(() => {
  void auth.init()
})
</script>

<template>
  <Sonner />
  <RealtimeHost />
  <RouterView v-if="auth.ready.value" />
</template>
