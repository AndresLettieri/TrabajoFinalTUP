import { get } from "../api/http";
import type { LoginRequest, LoginResponse } from "../../types/auth";

interface MockUser extends LoginResponse {
  password: string;
  active: boolean;
}

export async function login(
  credentials: LoginRequest
): Promise<LoginResponse | null> {
  const users = await get<MockUser[]>(
    `/users?email=${encodeURIComponent(credentials.email)}&password=${encodeURIComponent(credentials.password)}&active=true`
  );

  if (users.length === 0) {
    return null;
  }

  const { password, active, ...user } = users[0];

  return user;
}