import type { AuthSession, StoredUser } from "./types";

const USERS_KEY = "aero-auth-users";
const SESSION_KEY = "aero-auth-session";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null || raw === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadUsers(): StoredUser[] {
  if (typeof localStorage === "undefined") return [];
  return safeParse<StoredUser[]>(localStorage.getItem(USERS_KEY), []);
}

export function saveUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

export function loadSession(): AuthSession | null {
  if (typeof localStorage === "undefined") return null;
  const fromLocal = safeParse<AuthSession | null>(localStorage.getItem(SESSION_KEY), null);
  if (fromLocal && typeof fromLocal.email === "string") return fromLocal;
  if (typeof sessionStorage !== "undefined") {
    const fromTab = safeParse<AuthSession | null>(sessionStorage.getItem(SESSION_KEY), null);
    if (fromTab && typeof fromTab.email === "string") return fromTab;
  }
  return null;
}

export function saveSession(session: AuthSession, rememberMe: boolean): void {
  try {
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } else {
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {}
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {}
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const normalized = email.trim().toLowerCase();
  return loadUsers().find((u) => u.email.toLowerCase() === normalized);
}

export function findUserByLoginInput(raw: string): StoredUser | undefined {
  const q = raw.trim().toLowerCase();
  if (!q) return undefined;
  return loadUsers().find((u) => {
    if (u.email.toLowerCase() === q) return true;
    if (u.login && u.login.toLowerCase() === q) return true;
    return false;
  });
}
