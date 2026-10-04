import type { User } from "../../types/user";

const SESSION_KEY = "currentUser";

export function saveSession(user: User): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getCurrentUser(): User | null {
  const storedUser = sessionStorage.getItem(SESSION_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}