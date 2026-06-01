import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./AuthContext";

export function useRequireAuth() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const requireAuth = useCallback(
    (onAuthed?: () => void): boolean => {
      if (user) {
        onAuthed?.();
        return true;
      }
      navigate({ to: "/register" });
      return false;
    },
    [user, navigate],
  );

  return { user, requireAuth, isAuthed: Boolean(user) };
}
