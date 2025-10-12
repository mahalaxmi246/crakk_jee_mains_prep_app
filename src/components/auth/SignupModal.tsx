// src/components/auth/SignupModal.tsx
import React, { useState } from "react";
import Modal from "../ui/Modal";
import { useAuth } from "../../contexts/AuthContext";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ open, onClose, onSwitchToLogin }) => {
  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!formData.email) next.email = "Email is required";
    if (!formData.password) next.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const showFriendlyError = (code?: string, message?: string) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "⚠️ Account already exists. Please log in to continue.";
      default:
        return message || "Signup failed";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signUpWithEmail(formData.email, formData.password);

      alert("✅ Account created successfully. Please log in to continue.");
      onClose();
      onSwitchToLogin();
      setFormData({ email: "", password: "", confirmPassword: "" });
    } catch (err: any) {
      const msg = showFriendlyError(err?.code, err?.message);
      if (err?.code === "auth/email-already-in-use") {
        alert(msg);
        onClose();
        onSwitchToLogin();
      } else {
        setGeneralError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setGeneralError("");
    try {
      await signInWithGoogle("signup");
      alert("✅ Account created successfully with Google. You can log in now.");
      onClose();
      onSwitchToLogin();
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        alert("⚠️ Account already exists. Please log in to continue.");
        onClose();
        onSwitchToLogin();
      } else {
        setGeneralError(err?.message || "Google signup failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create account" canCloseWhileLoading={!isLoading}>
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
            className={`w-full px-3 py-2 border rounded-lg ${errors.password ? "border-red-500" : ""}`}
            disabled={isLoading}
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}

          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData((s) => ({ ...s, confirmPassword: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.confirmPassword ? "border-red-500" : ""
            }`}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword}</p>
          )}

          {generalError && <p className="text-sm text-red-600">{generalError}</p>}
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 flex justify-center items-center gap-2"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span>Sign up with Google</span>
          </button>
        </div>

        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-purple-600 hover:underline"
            disabled={isLoading}
          >
            Log in
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SignupModal;
