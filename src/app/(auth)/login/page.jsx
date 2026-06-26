"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Form states
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setSubmitting(true);

    try {
      const result = await login(phone, password, rememberMe);

      if (result.success) {
        setSuccess("Login successful! Redirecting...");

        // Redirect based on role
        setTimeout(() => {
          if (result.role === "ADMIN" || result.role === "SUPER_ADMIN") {
            router.push("/admin/dashboard");
          } else {
            router.push("/");
          }
        }, 1000);
      } else {
        setError(result.error || "Invalid credentials");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login page error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen flex items-center justify-center bg-[#FAF6F0] text-on-surface py-24 px-4 font-body">
      {/* Compact Centered Premium Login Card */}
      <div className="w-full max-w-[380px] bg-white border border-outline-variant/30 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col items-center text-center gap-1.5">
          {/* Logo */}
          <div className="flex items-center gap-1.5 text-primary mb-1">
            <span
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
            <span className="font-headline text-lg font-bold tracking-tight text-[#138D45]">
              The Herbal <span className="text-[#6FB74B]">Veda</span>
            </span>
          </div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">
            Welcome back
          </h1>
          <p className="text-on-surface-variant text-xs font-light">
            Enter your details to sign in to your account.
          </p>
        </header>

        {/* Form Section */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Feedback Banners */}
          {error && (
            <div className="p-3 bg-error-container text-on-error-container text-xs rounded-xl border border-error/20 flex items-start gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-base mt-0.5">error</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-primary-fixed text-on-primary-fixed-variant text-xs rounded-xl flex items-start gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-base mt-0.5">check_circle</span>
              <span>{success}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-bold text-on-surface-variant px-0.5"
              htmlFor="phone"
            >
              Phone Number
            </label>
            <input
              className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl transition-all duration-200 outline-none text-sm text-on-surface placeholder:text-outline/40"
              id="phone"
              placeholder="+919876543210"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-0.5">
              <label
                className="text-xs font-bold text-on-surface-variant"
                htmlFor="password"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <input
                className="w-full px-3.5 py-2.5 bg-surface-container-lowest border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl transition-all duration-200 outline-none text-sm text-on-surface placeholder:text-outline/40"
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
              />
              <button
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined text-base">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
          <button
            className="mt-2 w-full py-3 bg-primary text-on-primary font-bold rounded-xl shadow-md shadow-primary/10 hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing In...
              </>
            ) : (
              "Sign In to The Herbal Veda"
            )}
          </button>
        </form>

        {/* Footer Sign Up */}
        <p className="text-center text-on-surface-variant text-xs">
          Don't have an account?{" "}
          <Link
            className="text-primary font-bold underline underline-offset-4 hover:text-primary-container transition-colors"
            href="/register"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
    </>
  );
}
