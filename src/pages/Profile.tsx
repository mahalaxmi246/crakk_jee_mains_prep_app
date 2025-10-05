// src/pages/Profile.tsx
import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader, User, Mail, LogOut } from "lucide-react";

const Profile: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if not logged in
    if (!loading && !user) navigate("/");
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={32} className="animate-spin text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Loading profile...</h2>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initial = (user.username || user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-5xl font-bold">
              {initial}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {user.username || "Your Profile"}
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4 text-gray-700 mb-8">
            <div className="flex items-center space-x-3">
              <User size={20} className="text-purple-600" />
              <span>Username: {user.username}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail size={20} className="text-purple-600" />
              <span>Email: {user.email}</span>
            </div>
            {user.class_level && (
              <div className="flex items-center space-x-3">
                <span className="text-purple-600 font-medium">Class:</span>
                <span>{user.class_level}</span>
              </div>
            )}
            {user.stream && (
              <div className="flex items-center space-x-3">
                <span className="text-purple-600 font-medium">Stream:</span>
                <span>{user.stream}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={async () => {
                const confirmed = window.confirm("Are you sure you want to sign out?");
                if (confirmed) {
                  await logout();
                  navigate("/");
                }
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
