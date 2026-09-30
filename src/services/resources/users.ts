import { api } from "../api";
import type { UserData } from "../types";

export interface UserStats {
  user: UserData;
  posted: number;
  active: number;
  completedAsTasker: number;
  proposalsSent: number;
}

export type PublicProfile = UserData & { posted: number; completedAsTasker: number };

export const usersApi = {
  stats(): Promise<UserStats> {
    return api.get("/users/me/stats");
  },
  publicProfile(id: string): Promise<{ user: PublicProfile }> {
    return api.get(`/users/${id}/public`);
  },
};
