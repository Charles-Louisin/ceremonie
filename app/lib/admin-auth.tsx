"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

const STORAGE_KEY = "medaille:admin-auth-v1";
const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "admin12345";

interface AuthState {
  authenticated: boolean;
  hydrated: boolean;
}

type Action =
  | { type: "HYDRATE"; authenticated: boolean }
  | { type: "UNLOCK" }
  | { type: "LOCK" };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case "HYDRATE":
      return { authenticated: action.authenticated, hydrated: true };
    case "UNLOCK":
      return { ...state, authenticated: true };
    case "LOCK":
      return { ...state, authenticated: false };
    default:
      return state;
  }
}

interface AdminAuthApi {
  isAuthenticated: boolean;
  hydrated: boolean;
  unlock: (password: string) => boolean;
  lock: () => void;
}

const Ctx = createContext<AdminAuthApi | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    authenticated: false,
    hydrated: false,
  });

  useEffect(() => {
    const stored =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(STORAGE_KEY) === "1";
    dispatch({ type: "HYDRATE", authenticated: stored });
  }, []);

  const unlock = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      }
      dispatch({ type: "UNLOCK" });
      return true;
    }
    return false;
  }, []);

  const lock = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    dispatch({ type: "LOCK" });
  }, []);

  const api = useMemo<AdminAuthApi>(
    () => ({
      isAuthenticated: state.authenticated,
      hydrated: state.hydrated,
      unlock,
      lock,
    }),
    [state.authenticated, state.hydrated, unlock, lock],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useAdminAuth(): AdminAuthApi {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "useAdminAuth doit être utilisé à l'intérieur de <AdminAuthProvider>",
    );
  }
  return ctx;
}
