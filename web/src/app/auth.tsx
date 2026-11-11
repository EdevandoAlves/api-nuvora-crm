import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, clearToken, getToken, setToken } from "./api";
import type { Me } from "./types";

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  cnpj: string;
};

type AuthState =
  | { status: "loading"; user: null }
  | { status: "anonymous"; user: null }
  | { status: "authenticated"; user: Me };

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<Me>;
  register: (payload: RegisterPayload) => Promise<Me>;
  logout: () => void;
  refresh: () => Promise<Me>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: "loading",
    user: null,
  });

  useEffect(() => {
    let cancelled = false;
    const token = getToken();

    if (!token) {
      setState({ status: "anonymous", user: null });
      return;
    }

    api<Me>("/users/me")
      .then((user) => {
        if (!cancelled) {
          setState({ status: "authenticated", user });
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearToken();
          setState({ status: "anonymous", user: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unauthorized = () => {
      setState({ status: "anonymous", user: null });
    };
    window.addEventListener("nuvora:unauthorized", unauthorized);
    return () =>
      window.removeEventListener("nuvora:unauthorized", unauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken } = await api<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(accessToken);
    const user = await api<Me>("/users/me");
    setState({ status: "authenticated", user });
    return user;
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return login(payload.email, payload.password);
    },
    [login],
  );

  const logout = useCallback(() => {
    clearToken();
    setState({ status: "anonymous", user: null });
  }, []);

  const refresh = useCallback(async () => {
    const user = await api<Me>("/users/me");
    setState({ status: "authenticated", user });
    return user;
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
