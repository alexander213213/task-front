<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import AppHeader from "../components/AppHeader.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import Avatar from "../components/ui/avatar/Avatar.vue";
import Button from "../components/ui/button/Button.vue";
import Card from "../components/ui/card/Card.vue";
import Skeleton from "../components/ui/skeleton/Skeleton.vue";
import StarsInput from "../components/StarsInput.vue";
import { useAuth } from "../composables/useAuth";
import { usersApi, type UserStats } from "../services/resources/users";

const router = useRouter();
const auth = useAuth();

const stats = ref<UserStats | null>(null);
const loading = ref(true);
const loadError = ref<string | null>(null);
const showLogoutAll = ref(false);
const busy = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  loadError.value = null;
  try {
    stats.value = await usersApi.stats();
  } catch {
    loadError.value = "Failed to load profile";
  } finally {
    loading.value = false;
  }
}

async function onLogout(): Promise<void> {
  await auth.logout();
  toast.success("Logged out");
  await router.push("/");
}

async function onLogoutAll(): Promise<void> {
  busy.value = true;
  try {
    await auth.logoutAll();
    toast.success("Logged out everywhere");
    showLogoutAll.value = false;
    await router.push("/");
  } finally {
    busy.value = false;
  }
}

onMounted(() => void load());
</script>

<template>
  <AppHeader />
  <main class="mx-auto grid w-full max-w-3xl gap-6 px-4 py-6">
    <div v-if="loading" class="grid gap-4">
      <Skeleton class="h-40 w-full" />
      <Skeleton class="h-32 w-full" />
    </div>

    <div v-else-if="loadError || !stats" class="grid justify-items-center gap-3 py-16 text-center">
      <p class="text-sm text-destructive">{{ loadError ?? "Profile unavailable" }}</p>
      <Button variant="outline" @click="load()">Retry</Button>
    </div>

    <template v-else>
      <Card>
        <div class="flex items-center gap-4 p-6">
          <Avatar :alt="stats.user.username" class="h-14 w-14 text-lg" />
          <div class="grid gap-1">
            <p class="text-lg font-bold">{{ stats.user.firstName }} {{ stats.user.lastName }}</p>
            <p class="text-sm text-muted-foreground">@{{ stats.user.username }} · {{ stats.user.email }}</p>
            <div class="mt-1 flex items-center gap-2">
              <StarsInput :model-value="Math.round(stats.user.ratingAvg)" disabled :size="16" />
              <span class="text-xs text-muted-foreground">
                {{ stats.user.ratingAvg.toFixed(1) }} ({{ stats.user.ratingCount }})
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card v-for="stat in [
          { label: 'Posted', value: stats.posted },
          { label: 'Active', value: stats.active },
          { label: 'Completed', value: stats.completedAsTasker },
          { label: 'Proposals', value: stats.proposalsSent },
        ]" :key="stat.label">
          <div class="grid gap-1 p-5 text-center">
            <p class="text-2xl font-bold">{{ stat.value }}</p>
            <p class="text-xs text-muted-foreground">{{ stat.label }}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div class="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p class="text-sm font-semibold">Sessions</p>
            <p class="text-xs text-muted-foreground">Sign out here or on every device.</p>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="onLogout">Logout</Button>
            <Button variant="destructive" size="sm" @click="showLogoutAll = true">Logout everywhere</Button>
          </div>
        </div>
      </Card>
    </template>

    <ConfirmDialog
      :open="showLogoutAll"
      title="Log out everywhere?"
      description="Every session on every device will be ended."
      confirm-label="Log out everywhere"
      destructive
      :busy="busy"
      @update:open="showLogoutAll = $event"
      @confirm="onLogoutAll"
    />
  </main>
</template>
