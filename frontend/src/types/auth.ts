import type { User } from "./user";

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginResponse = User;