"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Full name is required");
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setSubmitting(true);

    try {
      const result = await register(name.trim(), email.trim(), phone.trim(), password);

      if (result.success) {
        // setSuccess("Registration successful! Logging you in...");

        // Auto-login succeeds, redirect based on role
        setTimeout(() => {
          if (result.role === "ADMIN" || result.role === "SUPER_ADMIN") {
            router.push("/admin/dashboard");
          } else {
            router.push("/");
          }
        }, 1500);
      } else {
        setError(result.error || "Registration failed");
        setSubmitting(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration page error:", err);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="w-full min-h-screen flex items-center justify-center bg-[#FAF6F0]/40 text-[#242926] py-24 px-4 font-body">
        {/* Compact Centered Premium Register Card */}
        <div className="w-full max-w-[400px] bg-white border border-[#E8EDEA] rounded-3xl shadow-xl shadow-[#2C3E37]/5 p-8 flex flex-col gap-6 animate-fadeIn">
          {/* Header */}
          <header className="flex flex-col items-center text-center gap-1">
            <Link href="/" className="flex items-center justify-center gap-2 mb-1 select-none">
              <img
                src="/logo/logo.png"
                alt="The Herbal Veda Logo"
                className="w-12 h-12 object-contain mix-blend-multiply"
              />
              <span className="font-headline text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#0D5C2F] to-[#4A8F3B] bg-clip-text text-transparent whitespace-nowrap">
                The Herbal Veda
              </span>
            </Link>
            <h1 className="text-2xl font-headline font-bold text-[#2C3E37] tracking-tight">
              Create an Account
            </h1>
            <p className="text-[#6B7A75] text-xs font-light">
              Join us to manage orders, wishlist, and track cart items.
            </p>
          </header>

          {/* Form Section */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Feedback Banners */}
            {error && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-100 flex items-start gap-2 animate-fadeIn font-medium">
                <span className="material-symbols-outlined text-base mt-0.5 shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-100 flex items-start gap-2 animate-fadeIn font-medium">
                <span className="material-symbols-outlined text-base mt-0.5 shrink-0">check_circle</span>
                <span>{success}</span>
              </div>
            )}

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#2C3E37] px-0.5" htmlFor="name">
                Full Name
              </label>
              <input
                className="w-full px-3.5 py-2.5 bg-[#FAF6F0]/20 border border-[#E8EDEA] focus:border-[#0D5C2F] focus:bg-white rounded-xl transition-all duration-200 outline-none text-sm text-[#2C3E37] placeholder:text-[#6B7A75]/40"
                id="name"
                placeholder="John Doe"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#2C3E37] px-0.5" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full px-3.5 py-2.5 bg-[#FAF6F0]/20 border border-[#E8EDEA] focus:border-[#0D5C2F] focus:bg-white rounded-xl transition-all duration-200 outline-none text-sm text-[#2C3E37] placeholder:text-[#6B7A75]/40"
                id="email"
                placeholder="john@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#2C3E37] px-0.5" htmlFor="phone">
                Phone Number
              </label>
              <input
                className="w-full px-3.5 py-2.5 bg-[#FAF6F0]/20 border border-[#E8EDEA] focus:border-[#0D5C2F] focus:bg-white rounded-xl transition-all duration-200 outline-none text-sm text-[#2C3E37] placeholder:text-[#6B7A75]/40"
                id="phone"
                placeholder="+919876543210"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#2C3E37] px-0.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-3.5 py-2.5 bg-[#FAF6F0]/20 border border-[#E8EDEA] focus:border-[#0D5C2F] focus:bg-white rounded-xl transition-all duration-200 outline-none text-sm text-[#2C3E37] placeholder:text-[#6B7A75]/40"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={submitting}
                />
                <button
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7A75] hover:text-[#0D5C2F] transition-colors cursor-pointer"
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

            {/* Submit Button */}
            <button
              className="mt-2 w-full py-3 bg-[#0D5C2F] hover:bg-[#0B4D27] text-white font-bold rounded-xl shadow-md shadow-[#0D5C2F]/10 hover:shadow-xl hover:shadow-[#0D5C2F]/15 hover:scale-[1.01] active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm"
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
                  {success ? "Success! Redirecting..." : "Registering..."}
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-[#6B7A75] text-xs">
            Already have an account?{" "}
            <Link
              className="text-[#0D5C2F] font-bold underline underline-offset-4 hover:text-[#4A8F3B] transition-colors"
              href="/login"
            >
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
