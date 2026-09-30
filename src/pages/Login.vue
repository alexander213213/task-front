<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import { toast } from "vue-sonner";
import { useAuth, isLinkRequired } from "../composables/useAuth";
import { useForm } from "../composables/useForm";
import { ApiError } from "../services/api";
import Button from "../components/ui/button/Button.vue";
import Card from "../components/ui/card/Card.vue";
import CardContent from "../components/ui/card/CardContent.vue";
import CardDescription from "../components/ui/card/CardDescription.vue";
import CardHeader from "../components/ui/card/CardHeader.vue";
import CardTitle from "../components/ui/card/CardTitle.vue";
import Input from "../components/ui/input/Input.vue";
import Label from "../components/ui/label/Label.vue";
import Separator from "../components/ui/separator/Separator.vue";

interface GoogleCredentialResponse {
  credential: string;
}

// Compatibility re-export until Tasks.vue migrates to services/types in F3.
export type { UserData } from "../services/types";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(opts: { client_id: string; callback: (res: GoogleCredentialResponse) => void }): void;
          renderButton(el: HTMLElement, opts: Record<string, unknown>): void;
        };
      };
    };
  }
}

const loginSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const router = useRouter();
const route = useRoute();
const auth = useAuth();

const form = useForm(loginSchema, { identifier: "", password: "" });
const googleReady = ref(false);
const googleButtonEl = ref<HTMLElement | null>(null);
const linkRequired = ref(false);
const linkToken = ref("");
const linkPassword = ref("");
const linkError = ref("");

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

function destination(): string {
  return typeof route.query.redirect === "string" ? route.query.redirect : "/tasks";
}

async function onSubmit(): Promise<void> {
  const valid = form.validateAll();
  if (!valid.ok) return;
  form.submitting.value = true;
  try {
    const id = valid.data.identifier.trim();
    await auth.login(
      emailRegex.test(id)
        ? { email: id, password: valid.data.password }
        : { username: id, password: valid.data.password }
    );
    toast.success("Logged in");
    await router.push(destination());
  } catch (err) {
    if (err instanceof ApiError) {
      form.applyServerError(err);
      toast.error(err.message);
    } else {
      toast.error("Login failed");
    }
  } finally {
    form.submitting.value = false;
  }
}

async function handleGoogleCredential(res: GoogleCredentialResponse): Promise<void> {
  linkRequired.value = false;
  linkError.value = "";
  try {
    await auth.googleLogin(res.credential);
    toast.success("Logged in with Google");
    await router.push(destination());
  } catch (err) {
    if (isLinkRequired(err)) {
      linkToken.value = res.credential;
      linkRequired.value = true;
    } else if (err instanceof ApiError) {
      toast.error(err.message);
    } else {
      toast.error("Google sign-in failed");
    }
  }
}

async function onLinkSubmit(): Promise<void> {
  if (!linkPassword.value) {
    linkError.value = "Password is required to link accounts";
    return;
  }
  try {
    await auth.googleLink(linkToken.value, linkPassword.value);
    toast.success("Google account linked");
    await router.push(destination());
  } catch (err) {
    linkError.value = err instanceof ApiError ? err.message : "Linking failed";
  }
}

function loadGis(): void {
  if (!GOOGLE_CLIENT_ID || window.google?.accounts) {
    setupGoogleButton();
    return;
  }
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.onload = () => setupGoogleButton();
  document.head.appendChild(script);
}

function setupGoogleButton(): void {
  if (!GOOGLE_CLIENT_ID || !window.google?.accounts || !googleButtonEl.value) return;
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (res) => void handleGoogleCredential(res),
  });
  window.google.accounts.id.renderButton(googleButtonEl.value, { theme: "filled_black", size: "large", width: 320 });
  googleReady.value = true;
}

onMounted(() => {
  loadGis();
});
</script>

<template>
  <div class="grid min-h-[80vh] place-items-center p-6">
    <Card class="w-full max-w-[400px]">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="grid gap-4" @submit.prevent="onSubmit">
          <div class="grid gap-2">
            <Label for="identifier">Username or email</Label>
            <Input
              id="identifier"
              v-model="form.values.identifier"
              placeholder="Username or email"
              autocomplete="username"
              @blur="form.touch('identifier')"
            />
            <p v-if="form.getError('identifier')" class="text-xs text-destructive">{{ form.getError('identifier') }}</p>
          </div>

          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="form.values.password"
              type="password"
              placeholder="Password"
              autocomplete="current-password"
              @blur="form.touch('password')"
            />
            <p v-if="form.getError('password')" class="text-xs text-destructive">{{ form.getError('password') }}</p>
          </div>

          <Button type="submit" :disabled="form.submitting.value" class="w-full">
            {{ form.submitting.value ? "Signing in..." : "Login" }}
          </Button>
        </form>

        <div v-if="GOOGLE_CLIENT_ID" class="mt-4 grid gap-3">
          <div class="flex items-center gap-3">
            <Separator class="flex-1" />
            <span class="text-xs text-muted-foreground">or</span>
            <Separator class="flex-1" />
          </div>
          <div ref="googleButtonEl" class="flex justify-center" />
          <p v-if="!googleReady" class="text-center text-xs text-muted-foreground">Loading Google sign-in...</p>

          <form v-if="linkRequired" class="grid gap-2 rounded-md border border-input p-3" @submit.prevent="onLinkSubmit">
            <p class="text-xs text-muted-foreground">
              This email already has an account. Enter its password to link Google.
            </p>
            <Input v-model="linkPassword" type="password" placeholder="Account password" autocomplete="current-password" />
            <p v-if="linkError" class="text-xs text-destructive">{{ linkError }}</p>
            <Button type="submit" size="sm">Link Google account</Button>
          </form>
        </div>

        <div class="mt-4 flex items-center justify-center gap-2 text-sm">
          <span class="text-muted-foreground">Don't have an account?</span>
          <Button variant="link" class="h-auto p-0" @click="router.push('/auth/signup')">Create one</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
