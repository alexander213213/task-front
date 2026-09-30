import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "@/composables/useAuth";
import { authApi } from "@/services/resources/auth";
import type { UserData } from "@/services/types";

vi.mock("@/services/resources/auth", () => ({
  authApi: {
    me: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    logoutAll: vi.fn(),
    google: vi.fn(),
    googleLink: vi.fn(),
  },
}));

const mockAuthApi = vi.mocked(authApi);

const USER: UserData = {
  id: "u1",
  username: "tester",
  email: "tester@test.com",
  firstName: "Test",
  lastName: "User",
  middleName: null,
  ratingAvg: 4.5,
  ratingCount: 2,
};

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth().resetForTests(null, false);
  });

  it("initializes the session from /auth/me", async () => {
    mockAuthApi.me.mockResolvedValue({ user: USER });
    const auth = useAuth();
    expect(auth.ready.value).toBe(false);

    await auth.init();

    expect(auth.ready.value).toBe(true);
    expect(auth.user.value).toEqual(USER);
    expect(auth.isAuthed.value).toBe(true);
  });

  it("clears the session when /auth/me fails", async () => {
    mockAuthApi.me.mockRejectedValue(new Error("nope"));
    const auth = useAuth();

    await auth.init();

    expect(auth.ready.value).toBe(true);
    expect(auth.user.value).toBeNull();
  });

  it("only initializes once", async () => {
    mockAuthApi.me.mockResolvedValue({ user: USER });
    const auth = useAuth();

    await Promise.all([auth.init(), auth.init()]);
    expect(mockAuthApi.me).toHaveBeenCalledTimes(1);
  });

  it("logs in, out, and out everywhere", async () => {
    const auth = useAuth();
    mockAuthApi.login.mockResolvedValue({ user: USER });
    await auth.login({ username: "tester", password: "x" });
    expect(auth.user.value).toEqual(USER);

    mockAuthApi.logout.mockResolvedValue(null);
    await auth.logout();
    expect(auth.user.value).toBeNull();

    await auth.login({ username: "tester", password: "x" });
    mockAuthApi.logoutAll.mockRejectedValue(new Error("network"));
    await auth.logoutAll();
    expect(auth.user.value).toBeNull();
  });

  it("handles Google login and link", async () => {
    const auth = useAuth();
    mockAuthApi.google.mockResolvedValue({ user: USER });
    await auth.googleLogin("token");
    expect(auth.user.value).toEqual(USER);

    auth.clearUser();
    mockAuthApi.googleLink.mockResolvedValue({ user: USER });
    await auth.googleLink("token", "Password123!");
    expect(auth.user.value).toEqual(USER);
  });
});
