"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    router.push("/login");
  };

  // Only show transparent navbar on the home page when not scrolled
  const isHome = pathname === "/";
  const isLightNavbar = !isHome || isScrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 font-label transition-all duration-300 ${
        isLightNavbar
          ? "bg-white border-b border-[#E8EDEA]/50 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16 lg:h-[72px]">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden border border-[#E8EDEA]/20 flex-shrink-0">
            <img
              src="/logo/logo.png"
              alt="The Herbal Veda Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain mix-blend-multiply"
            />
          </div>
          <span className={`font-headline text-base sm:text-lg lg:text-xl font-extrabold tracking-tight bg-gradient-to-r bg-clip-text text-transparent whitespace-nowrap transition-all duration-300 ${
            isLightNavbar
              ? "from-[#031F0F] to-[#1A3D14]"
              : "from-[#1E824C] to-[#145A32]"
          }`}>
            The Herbal Veda
          </span>
        </Link>

        {/* Center: Main Navigation (Desktop) */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 h-full">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors duration-300 ${
              isLightNavbar
                ? "text-[#242926] hover:text-[#2C3E37]"
                : "text-white hover:text-[#E8F5E9]"
            }`}
          >
            Shop
          </Link>
          <Link
            href="/products"
            className={`text-sm font-medium transition-colors duration-300 ${
              isLightNavbar
                ? "text-[#242926] hover:text-[#2C3E37]"
                : "text-white hover:text-[#E8F5E9]"
            }`}
          >
            Products
          </Link>
          <Link
            href="/categories"
            className={`text-sm font-medium transition-colors duration-300 ${
              isLightNavbar
                ? "text-[#242926] hover:text-[#2C3E37]"
                : "text-white hover:text-[#E8F5E9]"
            }`}
          >
            Categories
          </Link>
          {user && (
            <>
              <Link
                href="/orders"
                className={`text-sm font-medium transition-colors duration-300 ${
                  isLightNavbar
                    ? "text-[#242926] hover:text-[#2C3E37]"
                    : "text-white hover:text-[#E8F5E9]"
                }`}
              >
                My Orders
              </Link>
              <Link
                href="/addresses"
                className={`text-sm font-medium transition-colors duration-300 ${
                  isLightNavbar
                    ? "text-[#242926] hover:text-[#2C3E37]"
                    : "text-white hover:text-[#E8F5E9]"
                }`}
              >
                Addresses
              </Link>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          {/* Wishlist - Desktop only */}
          {user && (
            <Link
              href="/wishlist"
              className={`hidden sm:flex p-1.5 sm:p-2 transition-colors relative items-center rounded-lg hover:bg-black/5 ${
                isLightNavbar
                  ? "text-[#6B7A75] hover:text-[#2C3E37]"
                  : "text-white hover:text-[#E8F5E9]"
              }`}
              aria-label="Wishlist"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">favorite</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-[#2C3E37] text-[8px] sm:text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart - Desktop only */}
          {user && (
            <Link
              href="/cart"
              className={`hidden sm:flex p-1.5 sm:p-2 transition-colors relative items-center rounded-lg hover:bg-black/5 ${
                isLightNavbar
                  ? "text-[#6B7A75] hover:text-[#2C3E37]"
                  : "text-white hover:text-[#E8F5E9]"
              }`}
              aria-label="Shopping Cart"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">
                shopping_bag
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-[#2C3E37] text-[8px] sm:text-[10px] font-bold text-white animate-pulse">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile / Login */}
          <div className="flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer border border-transparent"
                  aria-label="User profile menu"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F0F3F1] text-[#2C3E37] flex items-center justify-center text-xs sm:text-sm font-bold uppercase">
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
                    <div className="absolute right-0 mt-2 w-52 sm:w-56 rounded-xl bg-white border border-[#E8EDEA] py-2 shadow-lg z-40 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-[#F0F3F1] mb-1">
                        <p className="text-[10px] text-[#6B7A75] font-bold uppercase tracking-wider">
                          Logged in as
                        </p>
                        <p className="text-sm font-medium text-[#242926] truncate">
                          {user.name || "User"}
                        </p>
                        <span className="inline-block mt-1 text-[9px] sm:text-[10px] font-bold bg-[#F0F3F1] text-[#2C3E37] px-1.5 py-0.5 rounded-md">
                          {user.role}
                        </span>
                      </div>
                      {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#242926] hover:bg-[#F5F8F6] transition-colors"
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
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer font-medium"
                      >
                        <span className="material-symbols-outlined text-lg">
                          logout
                        </span>
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={`inline-flex items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow ${
                  isLightNavbar
                    ? "bg-[#2C3E37] text-white hover:bg-[#1E2D27]"
                    : "bg-white text-[#2C3E37] hover:bg-gray-100"
                }`}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Icon (Hamburger) - Always visible on mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-black/5 ${
              isLightNavbar || isMobileMenuOpen
                ? "text-[#242926] hover:text-[#2C3E37]"
                : "text-white hover:text-[#E8F5E9]"
            }`}
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer - Shows only on mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[56px] sm:top-[64px] lg:top-[72px] bg-white border-b border-[#E8EDEA] shadow-lg px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-3 sm:gap-4 animate-slideDown z-40 max-h-[calc(100vh-56px)] overflow-y-auto">
          <Link
            href="/"
            className="text-base font-medium text-[#242926] hover:text-[#2C3E37] py-2.5 border-b border-[#F0F3F1] flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="material-symbols-outlined text-lg text-[#6B7A75]">storefront</span>
            Shop
          </Link>
          <Link
            href="/products"
            className="text-base font-medium text-[#242926] hover:text-[#2C3E37] py-2.5 border-b border-[#F0F3F1] flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="material-symbols-outlined text-lg text-[#6B7A75]">spa</span>
            Products
          </Link>
          <Link
            href="/categories"
            className="text-base font-medium text-[#242926] hover:text-[#2C3E37] py-2.5 border-b border-[#F0F3F1] flex items-center gap-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="material-symbols-outlined text-lg text-[#6B7A75]">category</span>
            Categories
          </Link>

          {user && (
            <>
              <Link
                href="/wishlist"
                className="text-base font-medium text-[#242926] hover:text-[#2C3E37] py-2.5 border-b border-[#F0F3F1] flex items-center justify-between"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-[#6B7A75]">favorite</span>
                  Wishlist
                </div>
                {wishlistCount > 0 && (
                  <span className="bg-[#2C3E37] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                className="text-base font-medium text-[#242926] hover:text-[#2C3E37] py-2.5 border-b border-[#F0F3F1] flex items-center justify-between"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-[#6B7A75]">shopping_bag</span>
                  Cart
                </div>
                {cartCount > 0 && (
                  <span className="bg-[#2C3E37] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/orders"
                className="text-base font-medium text-[#242926] hover:text-[#2C3E37] py-2.5 border-b border-[#F0F3F1] flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg text-[#6B7A75]">receipt_long</span>
                My Orders
              </Link>
              <Link
                href="/addresses"
                className="text-base font-medium text-[#242926] hover:text-[#2C3E37] py-2.5 border-b border-[#F0F3F1] flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg text-[#6B7A75]">location_on</span>
                Addresses
              </Link>
            </>
          )}

          {!user && (
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-[#2C3E37] text-white font-medium text-sm rounded-lg text-center hover:bg-[#1E2D27] transition-colors shadow-sm mt-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}

          {user && (
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 px-4 bg-red-50 text-red-600 font-medium text-sm rounded-lg text-center hover:bg-red-100 transition-colors mt-2 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}