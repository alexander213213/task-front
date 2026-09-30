import { computed, ref } from "vue";
import { ApiError } from "../services/api";
import { authApi, type LoginPayload } from "../services/resources/auth";
import type { UserData } from "../services/types";

const user = ref<UserData | null>(null);
const ready = ref(false);
const initializing = ref(false);

/** Singleton session state. Call init once (App.vue); every view shares it. */
export function useAuth() {
  const isAuthed = computed(() => user.value !== null);

  async function init(): Promise<void> {
    if (ready.value || initializing.value) return;
    initializing.value = true;
    try {
      const res = await authApi.me();
      user.value = res.user;
    } catch {
      user.value = null;
    } finally {
      ready.value = true;
      initializing.value = false;
    }
  }

  async function login(payload: LoginPayload): Promise<void> {
    const res = await authApi.login(payload);
    user.value = res.user;
  }

  /** Best-effort: local session clears even if the API call fails. */
  async function logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // Session already invalid server-side or network is down; still sign out locally.
    }
    user.value = null;
  }

  /** Best-effort: local session clears even if the API call fails. */
  async function logoutAll(): Promise<void> {
    try {
      await authApi.logoutAll();
    } catch {
      // Session already invalid server-side or network is down; still sign out locally.
    }
    user.value = null;
  }

  async function googleLogin(idToken: string): Promise<void> {
    const res = await authApi.google(idToken);
    user.value = res.user;
  }

  async function googleLink(idToken: string, password: string): Promise<void> {
    const res = await authApi.googleLink(idToken, password);
    user.value = res.user;
  }

  function setUser(next: UserData): void {
    user.value = next;
  }

  function clearUser(): void {
    user.value = null;
  }

  function resetForTests(next: UserData | null, isReady: boolean): void {
    user.value = next;
    ready.value = isReady;
    initializing.value = false;
  }

  return {
    user,
    ready,
    isAuthed,
    init,
    login,
    logout,
    logoutAll,
    googleLogin,
    googleLink,
    setUser,
    clearUser,
    resetForTests,
  };
}

export function isLinkRequired(err: unknown): boolean {
  return err instanceof ApiError && err.is("GOOGLE_LINK_REQUIRED");
}
