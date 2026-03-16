const API_BASE = import.meta.env.VITE_API_URL as string;
if (!API_BASE) throw new Error("Missing VITE_API_URL");

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

async function request<T>(
  path: string,
  opts: RequestInit & { json?: Json } = {}
): Promise<T> {
  const { json, headers, ...rest } = opts;

  const isAuthEndpoint =
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/register") ||
    path.startsWith("/auth/refresh") ||
    path.startsWith("/auth/logout");

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

  if (res.status === 401 && !isAuthEndpoint) {
    const refreshed = await doRefresh();
    if (refreshed) {
      res = await makeFetch(); // retry once
    }
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "message" in data
        ? String((data as any).message)
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, json?: Json) => request<T>(path, { method: "POST", json }),
  patch: <T>(path: string, json?: Json) => request<T>(path, { method: "PATCH", json }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};