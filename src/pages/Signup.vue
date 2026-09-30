<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { z } from "zod";
import { toast } from "vue-sonner";
import { useForm } from "../composables/useForm";
import { ApiError } from "../services/api";
import { authApi } from "../services/resources/auth";
import Button from "../components/ui/button/Button.vue";
import Card from "../components/ui/card/Card.vue";
import CardContent from "../components/ui/card/CardContent.vue";
import CardDescription from "../components/ui/card/CardDescription.vue";
import CardHeader from "../components/ui/card/CardHeader.vue";
import CardTitle from "../components/ui/card/CardTitle.vue";
import Input from "../components/ui/input/Input.vue";
import Label from "../components/ui/label/Label.vue";

const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signupSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .regex(usernameRegex, "3-20 chars, letters, numbers, underscore"),
    email: z.string().min(1, "Email is required").regex(emailRegex, "Must be a valid email"),
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().optional(),
    lastName: z.string().min(1, "Last name is required"),
    password: z.string().min(8, "Minimum of 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Does not match your password",
  });

type Field = "username" | "email" | "firstName" | "middleName" | "lastName" | "password" | "confirmPassword";

const router = useRouter();
const form = useForm(signupSchema, {
  username: "",
  email: "",
  firstName: "",
  middleName: "",
  lastName: "",
  password: "",
  confirmPassword: "",
});

const checking = ref<Record<string, boolean>>({});
let checkSeq = 0;

const FIELDS: Array<{ key: Field; label: string; type?: string; autocomplete?: string; optional?: boolean }> = [
  { key: "username", label: "Username", autocomplete: "username" },
  { key: "email", label: "Email", autocomplete: "email" },
  { key: "firstName", label: "First name", autocomplete: "given-name" },
  { key: "middleName", label: "Middle name", optional: true },
  { key: "lastName", label: "Last name", autocomplete: "family-name" },
  { key: "password", label: "Password", type: "password", autocomplete: "new-password" },
  { key: "confirmPassword", label: "Confirm password", type: "password", autocomplete: "new-password" },
];

async function checkTaken(field: "username" | "email"): Promise<void> {
  const value = form.values[field].trim();
  if (!value) return;
  if (field === "username" && !usernameRegex.test(value)) return;
  if (field === "email" && !emailRegex.test(value)) return;
  const seq = ++checkSeq;
  checking.value[field] = true;
  try {
    const res = await authApi.exists(field === "email" ? { email: value } : { username: value });
    if (seq !== checkSeq) return;
    if (res.exists) form.setError(field, field === "email" ? "Email already in use" : "Username already taken");
  } catch {
    // Existence check is advisory; submit handles conflicts authoritatively.
  } finally {
    if (seq === checkSeq) checking.value[field] = false;
  }
}

function onBlur(field: Field): void {
  form.touch(field);
  if (field === "username" || field === "email") void checkTaken(field);
}

async function onSubmit(): Promise<void> {
  const valid = form.validateAll();
  if (!valid.ok) return;
  form.submitting.value = true;
  try {
    await authApi.register({
      username: valid.data.username.trim(),
      email: valid.data.email.trim(),
      firstName: valid.data.firstName.trim(),
      middleName: valid.data.middleName?.trim() || undefined,
      lastName: valid.data.lastName.trim(),
      password: valid.data.password,
    });
    toast.success("Account created, sign in to continue");
    await router.push("/auth/login");
  } catch (err) {
    if (err instanceof ApiError) {
      form.applyServerError(err);
      toast.error(err.message);
    } else {
      toast.error("Sign-up failed");
    }
  } finally {
    form.submitting.value = false;
  }
}
</script>

<template>
  <div class="grid min-h-[80vh] place-items-center p-6">
    <Card class="w-full max-w-[400px]">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Enter your details to register</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="grid gap-4" @submit.prevent="onSubmit">
          <div v-for="field in FIELDS" :key="field.key" class="grid gap-2">
            <Label :for="field.key">
              {{ field.label }}<span v-if="field.optional" class="text-muted-foreground"> (optional)</span>
            </Label>
            <Input
              :id="field.key"
              v-model="form.values[field.key]"
              :type="field.type ?? 'text'"
              :placeholder="field.label"
              :autocomplete="field.autocomplete"
              @blur="onBlur(field.key)"
            />
            <p v-if="checking[field.key]" class="text-xs text-muted-foreground">Checking availability...</p>
            <p v-else-if="form.getError(field.key)" class="text-xs text-destructive">{{ form.getError(field.key) }}</p>
          </div>

          <Button type="submit" :disabled="form.submitting.value" class="w-full">
            {{ form.submitting.value ? "Creating account..." : "Sign up" }}
          </Button>
        </form>

        <div class="mt-4 flex items-center justify-center gap-2 text-sm">
          <span class="text-muted-foreground">Already have an account?</span>
          <Button variant="link" class="h-auto p-0" @click="router.push('/auth/login')">Sign in</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
