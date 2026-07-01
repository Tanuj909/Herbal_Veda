"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Authentication & Role Check Guard
  useEffect(() => {
    if (!loading) {
      if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        router.push("/login");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router]);

  // Handle mobile drawer close on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading || !isAuthorized) {
    return (
      <div className="w-full min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">
              eco
            </span>
          </div>
          <p className="text-xs text-on-surface-variant font-light tracking-wide">
            Verifying administrative access...
          </p>
        </div>
      </div>
    );
  }

  const navLinks = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: "dashboard",
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: "shopping_bag",
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: "category",
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: "receipt_long",
    },
  ];

  // SUPER_ADMIN exclusive tab
  if (user?.role === "SUPER_ADMIN") {
    navLinks.push({
      name: "Users Manager",
      path: "/admin/users",
      icon: "group",
    });
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex text-on-surface font-body">
      {/* 1. Sidebar Navigation (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1E2E24] text-white border-r border-[#2C3E33]/30 shrink-0">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#2C3E33]/30">
          <img
            src="/logo/logo.png"
            alt="The Herbal Veda Logo"
            className="w-8 h-8 object-contain bg-white/90 rounded-full p-0.5"
          />
          <span className="font-headline font-bold text-base tracking-wide text-white">
            The Herbal Veda
          </span>
        </div>

        {/* User Info Badge */}
        <div className="p-4 mx-4 mt-6 rounded-xl bg-[#293B2F] border border-[#3E5244]/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-sm uppercase">
            {user?.name ? user.name.substring(0, 2) : "AD"}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">{user?.name || "Administrator"}</h4>
            <span className="text-[10px] tracking-wide text-[#c4a66a] uppercase font-bold">
              {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Store Admin"}
            </span>
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-on-primary font-medium"
                    : "text-[#D1E0D7] hover:bg-[#25392D] hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#2C3E33]/30 flex flex-col gap-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[#D1E0D7] hover:bg-[#25392D] hover:text-white transition-all duration-200"
          >
            <span className="material-symbols-outlined text-lg">storefront</span>
            Back to Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[#D1E0D7] hover:bg-error-container/20 hover:text-[#FFA4A4] transition-all duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Sidebar Navigation Drawer (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#1E2E24] text-white z-50 lg:hidden flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#2C3E33]/30">
          <div className="flex items-center gap-3">
            <img
              src="/logo/logo.png"
              alt="The Herbal Veda Logo"
              className="w-8 h-8 object-contain bg-white/90 rounded-full p-0.5"
            />
            <span className="font-headline font-bold text-base tracking-wide text-white">
              The Herbal Veda
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-white hover:text-primary">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-4 mx-4 mt-6 rounded-xl bg-[#293B2F] border border-[#3E5244]/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white uppercase">
            {user?.name ? user.name.substring(0, 2) : "AD"}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">{user?.name || "Administrator"}</h4>
            <span className="text-[10px] tracking-wide text-[#c4a66a] uppercase font-bold">
              {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Store Admin"}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-on-primary font-medium"
                    : "text-[#D1E0D7] hover:bg-[#25392D] hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2C3E33]/30 flex flex-col gap-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[#D1E0D7] hover:bg-[#25392D] hover:text-white transition-all duration-200"
          >
            <span className="material-symbols-outlined text-lg">storefront</span>
            Back to Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[#D1E0D7] hover:bg-error-container/20 hover:text-[#FFA4A4] transition-all duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* 3. Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header (Mobile Toggle & User Summary) */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-outline-variant/30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 rounded-md text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <h2 className="text-base sm:text-lg font-headline font-bold text-on-surface hidden lg:block">
              Welcome Back, {user?.name ? user.name.split(" ")[0] : "Admin"}
            </h2>
            <h2 className="text-base font-headline font-bold text-on-surface lg:hidden">
              Control Panel
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-on-surface-variant font-light">Role Status</p>
              <span className="text-xs font-semibold text-primary">
                {user?.role === "SUPER_ADMIN" ? "Super Admin" : "Store Admin"}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#1E2E24] text-white flex items-center justify-center font-bold text-sm shadow-sm select-none border border-outline-variant/30">
              {user?.name ? user.name.substring(0, 1) : "A"}
            </div>
          </div>
        </header>

        {/* Scrollable Layout Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
