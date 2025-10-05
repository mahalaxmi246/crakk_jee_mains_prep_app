// src/components/auth/LoginModal.tsx
import React, { useState } from "react";
import Modal from "../ui/Modal";
import { useAuth } from "../../contexts/AuthContext";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({ emailOrUsername: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!formData.emailOrUsername) next.emailOrUsername = "Email or username is required";
    if (!formData.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(formData.emailOrUsername, formData.password);
      onClose();
      setFormData({ emailOrUsername: "", password: "" });
      setErrors({});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      if (/invalid|unauthorized/i.test(msg))
        setErrors({ emailOrUsername: "Invalid credentials" });
      else setGeneralError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Log in" canCloseWhileLoading={!isLoading}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Email or Username"
              value={formData.emailOrUsername}
              onChange={(e) => setFormData({ ...formData, emailOrUsername: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg ${errors.emailOrUsername ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            {errors.emailOrUsername && (
              <p className="mt-1 text-sm text-red-600">{errors.emailOrUsername}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg ${errors.password ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {generalError && <p className="text-sm text-red-600">{generalError}</p>}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Log in"}
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
