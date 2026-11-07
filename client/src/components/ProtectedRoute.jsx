import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';

// Route guard requiring valid user session and friendly role-gating for administrators
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, token, loading, isAdmin, demoLogin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500">Checking credentials...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Friendly Admin Only Access Screen
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Admin Access Required
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This dashboard is restricted to system administrators. You are currently signed in as a driver (<strong>{user.email}</strong>).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <button
              type="button"
              onClick={() => demoLogin('admin')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow"
            >
              <KeyRound className="w-4 h-4" />
              <span>Switch to Admin Demo</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
