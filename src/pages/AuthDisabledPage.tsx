import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

const AuthDisabledPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <ShieldOff size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Authentication Disabled</h2>
          <p className="text-gray-600 mb-8">
            Authentication features have been disabled. This includes login, signup, and user profiles.
          </p>
          
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">For Developers</h3>
          <p className="text-sm text-gray-600 mb-4">
            To re-enable authentication, see the rollback documentation in <code>docs/auth-rollback.md</code>
          </p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">
              This page is shown for all auth-related routes when authentication is disabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDisabledPage;