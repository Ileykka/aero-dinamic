import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearSession, findUserByEmail, findUserByLoginInput, loadSession, loadUsers, saveSession, saveUsers } from "./storage";
import type { StoredUser } from "./types";

export type RegisterResult =
  | { ok: true }
  | { ok: false; error: string; field?: "email" | "login" };

type AuthContextValue = {
  user: StoredUser | null;
  login: (
    loginInput: string,
    password: string,
    rememberMe: boolean,
  ) => { ok: true } | { ok: false; error: string };
  register: (payload: {
    name: string;
    surname: string;
    login: string;
    email: string;
    password: string;
  }) => RegisterResult;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readUserFromSession(): StoredUser | null {
  const session = loadSession();
  if (!session) return null;
  const u = findUserByEmail(session.email);
  if (!u) {
    clearSession();
    return null;
  }
  return u;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(() => readUserFromSession());

  const login = useCallback(
    (loginInput: string, password: string, rememberMe: boolean): { ok: true } | { ok: false; error: string } => {
    const u = findUserByLoginInput(loginInput);
    if (!u || u.password !== password) {
      return { ok: false as const, error: "Неверный логин или пароль" };
    }
    saveSession({ email: u.email }, rememberMe);
    setUser(u);
    return { ok: true as const };
  },
  [],
);

  const register = useCallback((payload: {
    name: string;
    surname: string;
    login: string;
    email: string;
    password: string;
  }): RegisterResult => {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedLogin = payload.login.trim().toLowerCase();
    if (findUserByEmail(normalizedEmail)) {
      return { ok: false as const, error: "Пользователь с таким email уже зарегистрирован", field: "email" as const };
    }
    if (loadUsers().some((u) => u.email.toLowerCase() === normalizedLogin || (u.login && u.login.toLowerCase() === normalizedLogin))) {
      return { ok: false as const, error: "Этот логин уже занят", field: "login" as const };
    }
    const next: StoredUser = {
      id: crypto.randomUUID(),
      name: payload.name.trim(),
      surname: payload.surname.trim(),
      email: normalizedEmail,
      login: normalizedLogin,
      password: payload.password,
    };
    const users = loadUsers();
    users.push(next);
    saveUsers(users);
    saveSession({ email: next.email }, true);
    setUser(next);
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
