const API_BASE = import.meta.env.VITE_API_URL as string;
if (!API_BASE) throw new Error("Missing VITE_API_URL");

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT_STATE"
  | "ALREADY_EXISTS"
  | "GOOGLE_LINK_REQUIRED"
  | "EMAIL_NOT_VERIFIED"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

export interface ApiOk<T> {
  ok: true;
  data: T;
  message?: string;
}

export interface ApiErr {
  ok: false;
  code: ErrorCode;
  message: string;
  issues?: Array<{ path: Array<string | number>; message: string; code: string }>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly issues: ApiErr["issues"];

  constructor(status: number, body: ApiErr) {
    super(body.message || `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code ?? "SERVER_ERROR";
    this.issues = body.issues;
  }

  is(code: ErrorCode): boolean {
    return this.code === code;
  }
}

type Json = Record<string, unknown>;

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function isAuthEndpoint(path: string): boolean {
  return (
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/register") ||
    path.startsWith("/auth/refresh") ||
    path.startsWith("/auth/google") ||
    path.startsWith("/auth/logout")
  );
}

/**
 * Typed transport. Returns the envelope's `data` on success and throws
 * ApiError (with code + Zod issues) otherwise. Retries once after a
 * transparent cookie refresh for non-auth endpoints.
 */
async function request<T>(path: string, opts: RequestInit & { json?: Json } = {}): Promise<T> {
  const { json, headers, ...rest } = opts;

  const makeFetch = () =>
    fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(headers ?? {}),
      },
      credentials: "include",
      body: json ? JSON.stringify(json) : rest.body,
    });

  let res = await makeFetch();

  if (res.status === 401 && !isAuthEndpoint(path)) {
    const refreshed = await doRefresh();
    if (refreshed) {
      res = await makeFetch(); // retry once
    }
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json() : null;

  if (!res.ok) {
    const body: ApiErr =
      payload && typeof payload === "object"
        ? {
            ok: false,
            code: (payload as ApiErr).code ?? "SERVER_ERROR",
            message: (payload as ApiErr).message ?? `Request failed (${res.status})`,
            issues: (payload as ApiErr).issues,
          }
        : { ok: false, code: "SERVER_ERROR", message: `Request failed (${res.status})` };
    throw new ApiError(res.status, body);
  }

  return (payload as ApiOk<T>).data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, json?: Json) => request<T>(path, { method: "POST", json }),
  patch: <T>(path: string, json?: Json) => request<T>(path, { method: "PATCH", json }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
