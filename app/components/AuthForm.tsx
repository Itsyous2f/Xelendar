"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Mail, Lock } from "lucide-react";

export default function AuthForm({ onAuth }: { onAuth: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (isSignUp) {
      // Sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      onAuth();
    } else {
      // Sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      onAuth();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Auth Card */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
            {isSignUp ? "Create your account" : "Sign in to Xelendar"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
              <input
                type="email"
                className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />
              <input
                type="password"
                className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span />
              <button type="button" className="text-blue-600 hover:underline dark:text-blue-400" disabled>
                Forgot your password?
              </button>
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-lg shadow transition-colors disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (isSignUp ? "Signing Up..." : "Signing In...") : (isSignUp ? "Sign Up" : "Sign In")}
            </button>
          </form>
          <div className="mt-6 text-center text-gray-600 dark:text-gray-300">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button className="text-blue-600 hover:underline dark:text-blue-400 font-semibold" onClick={() => setIsSignUp(false)}>
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button className="text-blue-600 hover:underline dark:text-blue-400 font-semibold" onClick={() => setIsSignUp(true)}>
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Right: Illustration/App Preview */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 opacity-90 z-0" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-8">
          {/* Placeholder for app preview or illustration */}
          <div className="bg-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <svg width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="white" className="mb-4">
              <rect x="3" y="5" width="18" height="16" rx="4" strokeWidth="2" />
              <rect x="7" y="9" width="2" height="2" rx="1" fill="white" />
              <rect x="11" y="9" width="2" height="2" rx="1" fill="white" />
              <rect x="15" y="9" width="2" height="2" rx="1" fill="white" />
            </svg>
            <h3 className="text-white text-2xl font-bold mb-2">Welcome to Xelendar</h3>
            <p className="text-blue-100 max-w-xs text-center">Your personal calendar companion for productivity and peace of mind.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 