<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { darkTheme, type GlobalThemeOverrides } from "naive-ui"
import { RouterView } from 'vue-router';
import { type UserData } from './pages/Login.vue';
import { api } from './services/api';

const user = ref<UserData | null>(null)
const authReady = ref(false)
const theme = ref(darkTheme)


onMounted(async () => {
  try {
    const res = await api.get<{ok: boolean, user: UserData}>("/auth/me")
    user.value = res.user
  } catch {
    user.value = null
  } finally {
    authReady.value = true
  }
})


const themeOverrides: GlobalThemeOverrides = {
  common: {
    bodyColor: "#242424",
  }
}

function setUser(u: UserData) {
  user.value = u
}

function removeUser() {
  user.value = null
}

</script>

<template>
    <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
      <n-message-provider>
        <n-modal-provider>
          <n-dialog-provider>
            <RouterView v-slot="{ Component, route }" v-if="authReady">
    <component
      :is="Component"
      :user="user"
      v-bind="route.fullPath === '/auth/login' ? { setUser } : route.fullPath === '/tasks' ? { removeUser } : {}"
    />
  </RouterView>
          </n-dialog-provider>
        </n-modal-provider>
      </n-message-provider>
    </n-config-provider>
</template>

<style scoped>

</style>
