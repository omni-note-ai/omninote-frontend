"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PenLine, AlertCircle } from "lucide-react";
import { useApp } from "@/lib/store";
import Link from "next/link";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoggedIn } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, direct immediately to workspace
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/home");
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await signup(name.trim(), email.trim(), password.trim());
      // After registration, redirect to login so user can sign in
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 px-6 relative transition-colors duration-300">
      
      {/* Top Header Row with Theme Switcher */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-end px-10 py-6">
        <ThemeToggle />
      </header>

      {/* Main Column */}
      <div className="flex flex-col items-center w-full max-w-[420px]">
        {/* Styled Logo nib */}
        <div className="mb-4">
          <PenLine className="w-8 h-8 text-gray-800 dark:text-gray-200" strokeWidth={2.0} />
        </div>

        {/* Action Title */}
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6 select-none">
          Create account
        </h1>

        {/* Rounded Card */}
        <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col">
            
            {/* Error Message Block */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs px-4 py-3.5 rounded-xl border border-red-100 dark:border-red-900/30 mb-5 animate-in fade-in zoom-in-95 duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Name Field */}
            <div className="flex flex-col mb-4">
              <label htmlFor="name" className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 transition duration-150"
              />
            </div>

            {/* Email Field */}
            <div className="flex flex-col mb-4">
              <label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 transition duration-150"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col mb-6">
              <label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 transition duration-150"
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-950 dark:bg-gray-50 hover:bg-gray-850 dark:hover:bg-gray-200 disabled:opacity-50 text-white dark:text-gray-950 font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-sm cursor-pointer"
            >
              {loading ? "Creating..." : "Sign up"}
            </button>

            {/* Account Redirection link */}
            <Link
              href="/login"
              className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mt-6 block text-center cursor-pointer"
            >
              Sign in to existing account
            </Link>

            {/* Back Out option */}
            <Link
              href="/"
              className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors mt-4 block text-center cursor-pointer"
            >
              Cancel
            </Link>

          </form>
        </div>
      </div>
    </div>
  );
}
