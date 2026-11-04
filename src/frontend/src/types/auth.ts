import type { User } from "../services/users/userService";

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginResponse = User;