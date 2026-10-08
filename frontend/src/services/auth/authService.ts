import { post } from "../api/http";
import type { LoginRequest, LoginResponse } from "../../types/auth";

export async function login(
  credentials: LoginRequest
): Promise<LoginResponse | null> {

  try {
    return await post<LoginResponse>(
      "/Auth/login",
      credentials,
      false
    );
  } catch (error) {
      console.error(
        "Error al iniciar sesión:",
        error
    );

    return null;
  }
}