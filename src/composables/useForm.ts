import { reactive, ref } from "vue";
import { z } from "zod";
import type { ApiError } from "../services/api";

export type FieldErrors = Record<string, string>;

/** Map backend Zod issues ([{ path, message }]) onto field errors. */
export function issuesToFieldErrors(issues: ApiError["issues"]): FieldErrors {
  const out: FieldErrors = {};
  if (!Array.isArray(issues)) return out;
  for (const issue of issues) {
    const path = Array.isArray(issue?.path) ? issue.path.join(".") : "";
    if (path && typeof issue?.message === "string" && !(path in out)) {
      out[path] = issue.message;
    }
  }
  return out;
}

function firstError(tree: z.ZodError, path: string): string | undefined {
  const found = tree.issues.find((i) => i.path.join(".") === path);
  return found?.message;
}

/**
 * Minimal hand-rolled form state over a Zod schema. No vee-validate:
 * values + per-field errors + touched tracking, with server issues
 * from ApiError merged in by field path.
 */
export function useForm<T extends z.ZodTypeAny>(schema: T, initial: z.input<T>) {
  const values = reactive({ ...(initial as Record<string, unknown>) }) as unknown as z.input<T>;
  const errors = reactive<FieldErrors>({});
  const touched = reactive<Record<string, boolean>>({});
  const submitting = ref(false);

  function setError(path: string, message: string | undefined): void {
    if (message) errors[path] = message;
    else delete errors[path];
  }

  function validateField(path: string): boolean {
    const result = schema.safeParse(values);
    if (result.success) {
      setError(path, undefined);
      return true;
    }
    setError(path, firstError(result.error, path));
    return getError(path) === undefined;
  }

  function getError(path: string): string | undefined {
    return errors[path];
  }

  function validateAll(): { ok: true; data: z.output<T> } | { ok: false } {
    const result = schema.safeParse(values);
    if (result.success) {
      for (const key of Object.keys(errors)) delete errors[key];
      return { ok: true, data: result.data };
    }
    for (const key of Object.keys(errors)) delete errors[key];
    for (const issue of result.error.issues) {
      const path = issue.path.join(".") || "_form";
      if (!(path in errors)) errors[path] = issue.message;
    }
    return { ok: false };
  }

  function touch(path: string): void {
    touched[path] = true;
    validateField(path);
  }

  function applyServerError(err: unknown): void {
    if (err && typeof err === "object" && "issues" in err) {
      Object.assign(errors, issuesToFieldErrors((err as ApiError).issues));
    }
  }

  function reset(next?: z.input<T>): void {
    const current = values as unknown as Record<string, unknown>;
    const base = { ...((next ?? initial) as Record<string, unknown>) };
    for (const key of Object.keys(current)) delete current[key];
    Object.assign(current, structuredClone(base));
    for (const key of Object.keys(errors)) delete errors[key];
    for (const key of Object.keys(touched)) delete touched[key];
  }

  return {
    values,
    errors,
    touched,
    submitting,
    validateField,
    getError,
    validateAll,
    touch,
    applyServerError,
    reset,
    setError,
  };
}
