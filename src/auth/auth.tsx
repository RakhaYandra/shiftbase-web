import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type Me } from "../api/client";

interface Auth {
  token: string | null;
  user: Me | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<Auth>({} as Auth);
const KEY = "shiftbase_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(KEY));
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .me(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(KEY);
        setToken(null);
      });
  }, [token]);

  async function login(email: string, password: string) {
    const { token: t } = await api.login(email, password);
    localStorage.setItem(KEY, t);
    setToken(t);
    setUser(await api.me(t));
  }

  function logout() {
    localStorage.removeItem(KEY);
    setToken(null);
    setUser(null);
  }

  return <Ctx.Provider value={{ token, user, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
