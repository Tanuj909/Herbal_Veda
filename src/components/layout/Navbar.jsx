"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Monitor scroll to update navbar background opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    router.push("/login");
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 font-label bg-background border-b border-outline-variant/10 shadow-sm py-4"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-primary group">
          <span
            className="material-symbols-outlined text-3xl transition-transform duration-300 group-hover:rotate-12"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
          <span className="font-headline text-xl font-bold tracking-tight text-on-surface">
            The Herbal <span className="text-primary">Veda</span>
          </span>
        </Link>

        {/* Center: Main Navigation (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-semibold text-black hover:text-primary transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/categories"
            className="text-sm font-semibold text-black hover:text-primary transition-colors"
          >
            Categories
          </Link>
          {user && (
            <Link
              href="/orders"
              className="text-sm font-semibold text-black hover:text-primary transition-colors"
            >
              My Orders
            </Link>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Search Icon (Desktop) */}
          <button className="hidden sm:flex text-on-surface-variant hover:text-primary p-2 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-2xl">search</span>
          </button>

          {/* Wishlist */}
          {user && (
            <Link
              href="/wishlist"
              className="text-on-surface-variant hover:text-primary p-2 transition-colors relative flex items-center"
              aria-label="Wishlist"
            >
              <span className="material-symbols-outlined text-2xl">favorite</span>
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                0
              </span>
            </Link>
          )}

          {/* Cart */}
          {user && (
            <Link
              href="/cart"
              className="text-on-surface-variant hover:text-primary p-2 transition-colors relative flex items-center"
              aria-label="Shopping Cart"
            >
              <span className="material-symbols-outlined text-2xl">
                shopping_bag
              </span>
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                0
              </span>
            </Link>
          )}

          {/* User Profile / Login */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30"
                  aria-label="User profile menu"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold uppercase">
                    {user.name ? user.name.slice(0, 2) : "U"}
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-48 rounded-xl bg-surface-container-lowest border border-outline-variant/30 py-2 shadow-lg z-40 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-outline-variant/20 mb-1">
                        <p className="text-xs text-outline font-bold uppercase tracking-wider">
                          Logged in as
                        </p>
                        <p className="text-sm font-bold text-on-surface truncate">
                          {user.name || "User"}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold bg-primary-fixed text-on-primary-fixed-variant px-1.5 py-0.5 rounded-md">
                          {user.role}
                        </span>
                      </div>
                      {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <span className="material-symbols-outlined text-lg">
                            dashboard
                          </span>
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-container/20 transition-colors text-left cursor-pointer font-bold"
                      >
                        <span className="material-symbols-outlined text-lg">
                          logout
                        </span>
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center w-9 h-9 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-all duration-200"
                aria-label="Log in"
              >
                <span className="material-symbols-outlined text-2.5xl">
                  account_circle
                </span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Icon (Hamburger) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-on-surface hover:text-primary p-2 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[72px] bg-background border-b border-outline-variant/20 shadow-lg px-6 py-6 flex flex-col gap-4 animate-slideDown z-40">
          <Link
            href="/"
            className="text-base font-bold text-black hover:text-primary py-2 border-b border-outline-variant/10"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Shop
          </Link>
          <Link
            href="/categories"
            className="text-base font-bold text-black hover:text-primary py-2 border-b border-outline-variant/10"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Categories
          </Link>

          {user && (
            <>
              <Link
                href="/wishlist"
                className="text-base font-bold text-black hover:text-primary py-2 border-b border-outline-variant/10 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg">favorite</span>
                Wishlist
              </Link>
              <Link
                href="/cart"
                className="text-base font-bold text-black hover:text-primary py-2 border-b border-outline-variant/10 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg">shopping_bag</span>
                Cart
              </Link>
              <Link
                href="/orders"
                className="text-base font-bold text-black hover:text-primary py-2 border-b border-outline-variant/10 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg">receipt_long</span>
                My Orders
              </Link>
            </>
          )}

          <div className="flex gap-4 mt-2">
            <button className="flex-1 py-3 px-4 bg-surface-container-low rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">search</span>
              Search
            </button>
            {!user && (
              <Link
                href="/login"
                className="flex-1 py-3 px-4 bg-primary text-on-primary rounded-xl text-center text-sm font-bold block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
