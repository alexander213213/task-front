import { api } from "../api";
import type { UserData } from "../types";

export interface RegisterPayload {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  password: string;
  confirmPassword?: string;
}

export type LoginPayload = { email: string; password: string } | { username: string; password: string };

export const authApi = {
  register(payload: RegisterPayload): Promise<null> {
    const { confirmPassword: _drop, ...body } = payload;
    return api.post<null>("/auth/register", body as Record<string, unknown>);
  },
  login(payload: LoginPayload): Promise<{ user: UserData }> {
    return api.post<{ user: UserData }>("/auth/login", payload as Record<string, unknown>);
  },
  logout(): Promise<null> {
    return api.post<null>("/auth/logout");
  },
  logoutAll(): Promise<null> {
    return api.post<null>("/auth/logout-all");
  },
  me(): Promise<{ user: UserData }> {
    return api.get<{ user: UserData }>("/auth/me");
  },
  exists(query: { email: string } | { username: string }): Promise<{ exists: boolean }> {
    const qs = new URLSearchParams(query as Record<string, string>).toString();
    return api.get<{ exists: boolean }>(`/auth/exist?${qs}`);
  },
  google(idToken: string): Promise<{ user: UserData }> {
    return api.post<{ user: UserData }>("/auth/google", { idToken });
  },
  googleLink(idToken: string, password: string): Promise<{ user: UserData }> {
    return api.post<{ user: UserData }>("/auth/google/link", { idToken, password });
  },
};
