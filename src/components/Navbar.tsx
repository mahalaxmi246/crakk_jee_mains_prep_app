// src/components/Navbar.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import LoginModal from "./auth/LoginModal";
import SignupModal from "./auth/SignupModal";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;
  const { user, loading, logout } = useAuth();

  // Close modals when user becomes available
  useEffect(() => {
    if (user) {
      setShowLoginModal(false);
      setShowSignupModal(false);
    }
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-100 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <Link to="/" className="flex items-center justify-center flex-1 md:flex-none">
            <h1 className="text-2xl font-bold text-purple-600">Crakk</h1>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`transition-colors ${
                isActive("/") ? "text-purple-600 font-medium" : "text-gray-600 hover:text-purple-600"
              }`}
            >
              Home
            </Link>
            <Link
              to="/chatbots"
              className={`transition-colors ${
                location.pathname.startsWith("/chatbots")
                  ? "text-purple-600 font-medium"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              Chatbots
            </Link>
            <Link
              to="/contests"
              className={`transition-colors ${
                isActive("/contests")
                  ? "text-purple-600 font-medium"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              Contests
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {loading ? (
              <span className="text-gray-500 text-sm">Loading…</span>
            ) : user ? (
              <>
                <button
                  onClick={() => navigate("/profile")}
                  className={`flex items-center space-x-2 transition-colors ${
                    isActive("/profile")
                      ? "text-purple-600 font-medium"
                      : "text-gray-600 hover:text-purple-600"
                  }`}
                >
                  <User size={18} />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    const confirmed = window.confirm("Are you sure you want to log out?");
                    if (confirmed) logout();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-4">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/profile");
                    }}
                    className={`text-left transition-colors ${
                      isActive("/profile") ? "text-purple-600 font-medium" : "text-gray-600"
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      const confirmed = window.confirm("Are you sure you want to log out?");
                      if (confirmed) {
                        logout();
                        setIsMenuOpen(false);
                      }
                    }}
                    className="text-left text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowLoginModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setShowSignupModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}

              <Link
                to="/"
                className={`transition-colors ${
                  isActive("/") ? "text-purple-600 font-medium" : "text-gray-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/chatbots"
                className={`transition-colors ${
                  isActive("/chatbots") ? "text-purple-600 font-medium" : "text-gray-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Chatbots
              </Link>
              <Link
                to="/contests"
                className={`transition-colors ${
                  isActive("/contests") ? "text-purple-600 font-medium" : "text-gray-600"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contests
              </Link>
            </div>
          </div>
        )}

        {/* Modals */}
        <LoginModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
        />
        <SignupModal
          open={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      </div>
    </nav>
  );
};

export default Navbar;
