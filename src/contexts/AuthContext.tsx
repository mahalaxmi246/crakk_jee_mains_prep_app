import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  User,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { exchangeFirebaseIdToken } from "../lib/authHandlers";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isVerified: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (mode?: "login" | "signup") => Promise<void>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🟡 NEW: Firebase → Backend token exchange here
 // src/contexts/AuthContext.tsx (excerpt of the effect)
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (u) => {
    setUser(u);
    setLoading(false);

    if (!u) {
      localStorage.removeItem("access_token");
      return;
    }

    try {
      // 🔥 force-refresh so it can't be stale
      const idToken = await u.getIdToken(true);
      console.log("[Auth] sending Firebase idToken prefix:", idToken.slice(0, 20));
      await exchangeFirebaseIdToken(idToken);
      console.log("✅ Firebase token exchanged successfully");
    } catch (err) {
      console.error("❌ Firebase → backend JWT exchange failed:", err);
    }
  });

  return () => unsubscribe();
}, []);


  const isVerified = useMemo(() => !!user?.emailVerified, [user]);

  const signUpWithEmail = async (email: string, password: string) => {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods.length > 0) {
      const provider = methods.includes("password") ? "email & password" : methods[0];
      const e = new Error(`Account already exists with ${provider}.`);
      (e as any).code = "auth/email-already-in-use";
      throw e;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    await signOut(auth);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    if (methods.length === 0) {
      const e = new Error("No account found. Please sign up first.");
      (e as any).code = "auth/user-not-found";
      throw e;
    }

    if (!methods.includes("password")) {
      const e = new Error(
        `This account is registered using ${methods[0]}. Please use that method to log in.`
      );
      (e as any).code = "auth/wrong-signin-method";
      throw e;
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);

    if (!cred.user.emailVerified) {
      await signOut(auth);
      const e = new Error("Please verify your email before logging in.");
      (e as any).code = "auth/email-not-verified";
      throw e;
    }
  };

  const signInWithGoogle = async (mode: "login" | "signup" = "login") => {
    const cred = await signInWithPopup(auth, googleProvider);
    const email = cred.user.email!;
    const methods = await fetchSignInMethodsForEmail(auth, email);

    if (mode === "signup") {
      if (methods.length > 0 && !methods.includes("google.com")) {
        await signOut(auth);
        const e = new Error("Account already exists. Please log in.");
        (e as any).code = "auth/email-already-in-use";
        throw e;
      }
      return;
    }

    if (mode === "login") {
      if (methods.length === 0) return;
      if (!methods.includes("google.com")) {
        await signOut(auth);
        const e = new Error(
          `This account is registered using ${methods[0]}. Please use that method.`
        );
        (e as any).code = "auth/wrong-signin-method";
        throw e;
      }
    }
  };

  const resendVerification = async () => {
    if (!auth.currentUser) throw new Error("Not signed in.");
    await sendEmailVerification(auth.currentUser);
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isVerified,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        resendVerification,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
