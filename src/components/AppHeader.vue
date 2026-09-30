<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { useAuth } from "../composables/useAuth";
import Avatar from "./ui/avatar/Avatar.vue";
import Button from "./ui/button/Button.vue";

const auth = useAuth();
const route = useRoute();
const router = useRouter();

const links = [
  { to: "/feed", label: "Feed" },
  { to: "/my-tasks", label: "My tasks" },
  { to: "/assigned", label: "Assigned" },
  { to: "/profile", label: "Profile" },
];

function isActive(to: string): boolean {
  return route.path === to || (to !== "/feed" && route.path.startsWith(to));
}

async function onLogout(): Promise<void> {
  await auth.logout();
  toast.success("Logged out");
  await router.push("/");
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
    <div class="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
      <button class="text-base font-bold tracking-tight" @click="router.push('/feed')">
        Task<span class="text-primary">Market</span>
      </button>
      <nav class="flex items-center gap-1">
        <Button
          v-for="link in links"
          :key="link.to"
          :variant="isActive(link.to) ? 'secondary' : 'ghost'"
          size="sm"
          @click="router.push(link.to)"
        >
          {{ link.label }}
        </Button>
      </nav>
      <div class="flex items-center gap-3">
        <div v-if="auth.user.value" class="flex items-center gap-2">
          <Avatar :alt="auth.user.value.username" />
          <span class="hidden text-sm text-muted-foreground sm:inline">{{ auth.user.value.username }}</span>
        </div>
        <Button variant="outline" size="sm" @click="onLogout">Logout</Button>
      </div>
    </div>
  </header>
</template>
