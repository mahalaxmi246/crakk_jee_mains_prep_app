import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import {
  authHandlers,
  UserDTO,
  getAccessToken,
  setAccessToken,
} from "../lib/authHandlers";

type AuthContextType = {
  user: UserDTO | null;
  loading: boolean;

  // auth actions
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // login modal + gating helpers
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  /** Run an action, but if not logged in, show login and run it after login succeeds */
  requireAuth: (action: () => void | Promise<void>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

type Props = { children: React.ReactNode };

const applyAxiosAuthHeader = () => {
  const token = getAccessToken();
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // central login modal state
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const afterLoginActionRef = useRef<null | (() => void | Promise<void>)>(null);

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

  const refreshUser = useCallback(async () => {
    try {
      const u = await authHandlers.getUser();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      // keep axios header aligned with current token
      applyAxiosAuthHeader();
    }
  }, []);

  useEffect(() => {
    // On mount, align axios header and (if token exists) fetch current user
    (async () => {
      setLoading(true);
      applyAxiosAuthHeader();
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
    // token saved inside authHandlers.login; align header + fetch user
    applyAxiosAuthHeader();
    await refreshUser();
    setLoginModalOpen(false);
  };

  const logout = async () => {
    await authHandlers.logout();
    setAccessToken(undefined);
    setUser(null);
    applyAxiosAuthHeader();
  };

  /** Gate an action behind auth; remember it and execute after login succeeds */
  const requireAuth = (action: () => void | Promise<void>) => {
    if (!user) {
      afterLoginActionRef.current = action;
      setLoginModalOpen(true);
      return;
    }
    action();
  };

  // When user changes from null -> object (i.e., login success), run pending action once
  const prevUserRef = useRef<UserDTO | null>(null);
  useEffect(() => {
    const previously = prevUserRef.current;
    prevUserRef.current = user;
    if (!previously && user && afterLoginActionRef.current) {
      const fn = afterLoginActionRef.current;
      afterLoginActionRef.current = null;
      // run after a microtask to let modal close cleanly
      Promise.resolve().then(() => void fn());
    }
  }, [user]);

  // Optional: if any request gets 401, reopen the login modal
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (r) => r,
      (err) => {
        if (err?.response?.status === 401) {
          setUser(null);
          setAccessToken(undefined);
          applyAxiosAuthHeader();
          setLoginModalOpen(true);
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        loginModalOpen,
        openLoginModal,
        closeLoginModal,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
