// src/components/auth/LoginModal.tsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "../ui/Modal";
import { useAuth } from "../../contexts/AuthContext";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onSwitchToSignup }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithEmail, signInWithGoogle } = useAuth();

  const from = (location.state as any)?.from || "/";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!formData.email) next.email = "Email is required";
    if (!formData.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const showFriendlyError = (code?: string, message?: string) => {
    switch (code) {
      case "auth/user-not-found":
        return "No account found. Please sign up first.";
      case "auth/email-not-verified":
        return "Please verify your email. We’ve sent a link to your inbox.";
      case "auth/wrong-password":
        return "Incorrect password. Try again.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      case "auth/wrong-signin-method":
        return message || "Please use the correct method to log in.";
      default:
        return message || "Login failed";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signInWithEmail(formData.email, formData.password);
      navigate(from, { replace: true });
      onClose();
    } catch (err: any) {
      setGeneralError(showFriendlyError(err?.code, err?.message));
      if (err?.code === "auth/email-not-verified") {
        // Push user to verify page if you prefer hard redirect
        navigate("/verify-email", { replace: true });
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setGeneralError("");
    try {
      await signInWithGoogle("login");
      navigate(from, { replace: true });
      onClose();
    } catch (err: any) {
      const code = err?.code as string | undefined;
      const msg =
        code === "auth/wrong-signin-method"
          ? err?.message
          : "Google login failed";
      setGeneralError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Log in" canCloseWhileLoading={!isLoading}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg ${errors.email ? "border-red-500" : ""}`}
            disabled={isLoading}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData((s) => ({ ...s, password: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.password ? "border-red-500" : ""
            }`}
            disabled={isLoading}
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}

          {generalError && <p className="text-sm text-red-600">{generalError}</p>}
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 flex justify-center items-center gap-2"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span>Log in with Google</span>
          </button>
        </div>

        <div className="mt-6 text-center text-sm">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-purple-600 hover:underline"
            disabled={isLoading}
          >
            Sign up
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LoginModal;
