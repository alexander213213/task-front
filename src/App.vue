<script setup lang="ts">
import { onMounted } from 'vue';
import { darkTheme, type GlobalThemeOverrides } from "naive-ui"
import { RouterView } from 'vue-router';
import { useAuth } from './composables/useAuth';
import Sonner from './components/ui/sonner/Sonner.vue';

const auth = useAuth()
const theme = darkTheme

onMounted(() => {
  void auth.init()
})

const themeOverrides: GlobalThemeOverrides = {
  common: {
    bodyColor: "#242424",
  }
}
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-modal-provider>
        <n-dialog-provider>
          <Sonner />
          <RouterView v-slot="{ Component, route }" v-if="auth.ready.value">
            <component
              :is="Component"
              :user="auth.user.value"
              v-bind="route.fullPath === '/auth/login' ? { setUser: auth.setUser } : route.fullPath === '/tasks' ? { removeUser: auth.clearUser } : {}"
            />
          </RouterView>
        </n-dialog-provider>
      </n-modal-provider>
    </n-message-provider>
  </n-config-provider>
</template>
