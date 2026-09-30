import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import { router } from "@/services/router";

vi.mock("@/composables/useAuth", () => {
  const user = ref(null);
  const ready = ref(true);
  return {
    useAuth: () => ({
      user,
      ready,
      isAuthed: computed(() => user.value !== null),
      init: vi.fn(async () => undefined),
      __setUser: (next: unknown) => {
        user.value = next;
      },
    }),
  };
});

type MockAuth = { __setUser: (next: unknown) => void };

// eslint-disable-next-line @typescript-eslint/no-var-requires
async function auth(): Promise<MockAuth> {
  const mod = (await import("@/composables/useAuth")) as unknown as { useAuth: () => MockAuth };
  return mod.useAuth();
}

describe("router guards", () => {
  beforeEach(async () => {
    (await auth()).__setUser(null);
    await router.push("/");
  });

  it("redirects guests away from guarded routes", async () => {
    await router.push("/tasks");
    expect(router.currentRoute.value.path).toBe("/auth/login");
    expect(router.currentRoute.value.query.redirect).toBe("/tasks");
  });

  it("lets authed users into guarded routes", async () => {
    (await auth()).__setUser({ id: "u1", username: "tester" });
    await router.push("/tasks");
    expect(router.currentRoute.value.path).toBe("/tasks");
  });

  it("redirects authed users away from guest routes", async () => {
    (await auth()).__setUser({ id: "u1", username: "tester" });
    await router.push("/auth/login");
    expect(router.currentRoute.value.path).toBe("/tasks");
  });

  it("honors the redirect target after login", async () => {
    (await auth()).__setUser({ id: "u1", username: "tester" });
    await router.push({ path: "/auth/login", query: { redirect: "/tasks" } });
    expect(router.currentRoute.value.path).toBe("/tasks");
  });
});
