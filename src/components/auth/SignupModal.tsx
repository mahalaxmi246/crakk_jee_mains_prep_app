// src/components/auth/SignupModal.tsx
import React, { useState } from "react";
import Modal from "../ui/Modal";
import { authHandlers } from "../../lib/authHandlers";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ open, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const username =
        formData.name?.trim() ||
        (formData.email.includes("@") ? formData.email.split("@")[0] : formData.email);

      await authHandlers.register({
        username,
        email: formData.email,
        password: formData.password,
      });

      // ✅ Close signup and open login modal (no auto login)
      onClose();
      onSwitchToLogin(); // 👈 this opens the login modal right after signup

      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setErrors({});

      // Optional: Show a toast/alert
      alert("Account created successfully. Please log in to continue.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      if (/exists/i.test(msg)) setErrors({ email: msg });
      else setGeneralError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create account" canCloseWhileLoading={!isLoading}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name (optional)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            disabled={isLoading}
          />

          <div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg ${errors.email ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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

          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {generalError && <p className="text-sm text-red-600">{generalError}</p>}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Create account"}
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
