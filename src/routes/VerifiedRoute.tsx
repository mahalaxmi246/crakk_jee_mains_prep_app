// src/routes/VerifiedRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const VerifiedRoute: React.FC = () => {
  const { user, loading, isVerified } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    // Save intended path → your login modal can read location.state.from
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
};

export default VerifiedRoute;
