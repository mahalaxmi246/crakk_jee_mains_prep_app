// src/pages/VerifyEmailPage.tsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";

const VerifyEmailPage: React.FC = () => {
  const { user, resendVerification, logout } = useAuth();

  const resend = async () => {
    try {
      await resendVerification();
      alert("Verification email sent!");
    } catch (err: any) {
      alert(err?.message || "Failed to resend");
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">Verify your Email</h2>
      <p>
        We sent a verification link to: <strong>{user?.email}</strong>
      </p>
      <p className="mt-2">Once verified, refresh or log in again.</p>
      <div className="mt-6 flex justify-center gap-4">
        <button
          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          onClick={resend}
        >
          Resend Email
        </button>
        <button
          className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          onClick={logout}
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
