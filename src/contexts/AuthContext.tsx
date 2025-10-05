// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  authHandlers,
  UserDTO,
  getAccessToken,
  setAccessToken,
} from "../lib/authHandlers";

type AuthContextType = {
  user: UserDTO | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

type Props = { children: React.ReactNode };

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const u = await authHandlers.getUser();
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // On mount, if there is a token, fetch current user
    (async () => {
      setLoading(true);
      const token = getAccessToken();
      if (token) {
        await refreshUser();
      } else {
        setUser(null);
      }
      setLoading(false);
    })();
  }, [refreshUser]);

  const login = async (emailOrUsername: string, password: string) => {
    await authHandlers.login({ emailOrUsername, password });
    // token saved inside authHandlers.login; now fetch user
    await refreshUser();
  };

  const logout = async () => {
    await authHandlers.logout();
    setAccessToken(undefined);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
