import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "@/services/api";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("api transport", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns envelope data on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(200, { ok: true, data: { user: { id: "1" } } }))
    );

    const data = await api.get<{ user: { id: string } }>("/users/me/stats");
    expect(data).toEqual({ user: { id: "1" } });
  });

  it("throws ApiError with code, message, and issues", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(400, {
          ok: false,
          code: "VALIDATION_ERROR",
          message: "Wrong Login Object Format",
          issues: [{ path: ["email"], message: "Invalid email", code: "invalid_format" }],
        })
      )
    );

    const err = await api.post("/auth/login", {}).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.status).toBe(400);
    expect(err.issues).toHaveLength(1);
    expect(err.is("VALIDATION_ERROR")).toBe(true);
  });

  it("refreshes once and retries after a 401", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).endsWith("/auth/refresh")) return jsonResponse(200, { ok: true, data: null });
      if (fetchMock.mock.calls.filter((c) => !String(c[0]).endsWith("/auth/refresh")).length === 1) {
        return jsonResponse(401, { ok: false, code: "UNAUTHORIZED", message: "Invalid Credentials" });
      }
      return jsonResponse(200, { ok: true, data: { tasks: [] } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = await api.get<{ tasks: unknown[] }>("/tasks");
    expect(data).toEqual({ tasks: [] });
    expect(fetchMock.mock.calls.filter((c) => String(c[0]).endsWith("/auth/refresh"))).toHaveLength(1);
  });

  it("surfaces the original 401 when refresh fails", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).endsWith("/auth/refresh")) return jsonResponse(401, { ok: false, code: "UNAUTHORIZED", message: "x" });
      return jsonResponse(401, { ok: false, code: "UNAUTHORIZED", message: "Invalid Credentials" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const err = await api.get("/tasks").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("never refreshes for auth endpoints", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(401, { ok: false, code: "UNAUTHORIZED", message: "Invalid Credentials" })
    );
    vi.stubGlobal("fetch", fetchMock);

    await api.post("/auth/login", {}).catch(() => undefined);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
