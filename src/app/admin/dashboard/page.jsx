"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    revenue: 0,
    ordersCount: 0,
    productsCount: 0,
    usersCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        // Fetch stats, orders, and products in parallel
        const [statsRes, ordersRes, productsRes] = await Promise.allSettled([
          axios.get("/api/admin/stats", config),
          axios.get("/api/orders", config),
          axios.get("/api/products?all=true", config),
        ]);

        let statsData = { totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 };
        let ordersList = [];
        let productsList = [];

        if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
          statsData = statsRes.value.data.data;
        }
        if (ordersRes.status === "fulfilled" && ordersRes.value.data.success) {
          ordersList = ordersRes.value.data.data;
        }
        if (productsRes.status === "fulfilled" && productsRes.value.data.success) {
          productsList = productsRes.value.data.data;
        }

        setStats({
          revenue: statsData.totalRevenue,
          ordersCount: statsData.totalOrders,
          productsCount: statsData.totalProducts,
          usersCount: statsData.totalUsers,
        });

        setRecentOrders(ordersList.slice(0, 5));
        setLowStockProducts(productsList.filter((p) => p.quantity <= 5));
      } catch (error) {
        console.error("Dashboard page data load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-white/60 rounded-lg w-48 border border-outline-variant/20"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-outline-variant/30 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-80 bg-white border border-outline-variant/30 rounded-2xl"></div>
          <div className="h-80 bg-white border border-outline-variant/30 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Helper for Order Status pill colors
  const getStatusStyle = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "CONFIRMED":
      case "PROCESSING":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "PENDING":
        return "bg-sky-50 text-sky-700 border-sky-100";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-surface-container-low text-on-surface border-outline-variant/30";
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">
            Dashboard
          </h1>
          <p className="text-xs text-on-surface-variant font-light mt-0.5">
            Store performance metrics, inventory states, and transactional analytics.
          </p>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales Revenue */}
        <div className="bg-white border border-outline-variant/30 p-5 rounded-2xl shadow-xs flex items-center justify-between group hover:shadow-sm hover:scale-[1.01] transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-on-surface-variant font-light">Total Revenue</span>
            <span className="text-2xl font-headline font-bold text-on-surface">
              ${stats.revenue.toFixed(2)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined">payments</span>
          </div>
        </div>

        {/* Orders Count */}
        <div className="bg-white border border-outline-variant/30 p-5 rounded-2xl shadow-xs flex items-center justify-between group hover:shadow-sm hover:scale-[1.01] transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-on-surface-variant font-light">Total Orders</span>
            <span className="text-2xl font-headline font-bold text-on-surface">
              {stats.ordersCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
        </div>

        {/* Products Cataloged */}
        <div className="bg-white border border-outline-variant/30 p-5 rounded-2xl shadow-xs flex items-center justify-between group hover:shadow-sm hover:scale-[1.01] transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-on-surface-variant font-light">Catalog Size</span>
            <span className="text-2xl font-headline font-bold text-on-surface">
              {stats.productsCount} products
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined">shopping_bag</span>
          </div>
        </div>

        {/* Registered Users */}
        <div className="bg-white border border-outline-variant/30 p-5 rounded-2xl shadow-xs flex items-center justify-between group hover:shadow-sm hover:scale-[1.01] transition-all duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-on-surface-variant font-light">Active Users</span>
            <span className="text-2xl font-headline font-bold text-on-surface">
              {stats.usersCount} users
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined">group</span>
          </div>
        </div>
      </div>

      {/* Main Splits Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Card */}
        <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-xs overflow-hidden lg:col-span-2 flex flex-col">
          <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
            <h3 className="text-base font-headline font-bold text-on-surface">
              Recent Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-primary hover:text-primary-container font-semibold transition-colors flex items-center gap-1"
            >
              View All Orders
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-[#c4c4c4] mb-2">
                  shopping_cart
                </span>
                <p className="text-sm text-on-surface-variant font-light">No orders placed yet.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF6F0] text-on-surface-variant border-b border-outline-variant/20">
                    <th className="p-4 font-semibold">Order ID</th>
                    <th className="p-4 font-semibold">Customer</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Total Amount</th>
                    <th className="p-4 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-surface-container-lowest/40 transition-colors">
                      <td className="p-4 font-semibold text-on-surface-variant font-mono">
                        #{ord.id.toString().substring(0, 8)}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-on-surface">{ord.user?.name || "Guest User"}</div>
                        <div className="text-[10px] text-on-surface-variant font-light">{ord.user?.email}</div>
                      </td>
                      <td className="p-4 text-on-surface-variant font-light">
                        {new Date(ord.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="p-4 font-bold text-on-surface">
                        ${parseFloat(ord.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(ord.status)}`}>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Low Stock Alerts & Quick Actions */}
        <div className="flex flex-col gap-6">
          {/* Low Stock Warn */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-xs p-5">
            <h3 className="text-base font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-warning text-lg animate-pulse">
                warning
              </span>
              Inventory Warnings
            </h3>

            {lowStockProducts.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center">
                <span className="material-symbols-outlined text-2xl text-emerald-600 mb-1">
                  check_circle
                </span>
                <p className="text-xs text-emerald-800 font-semibold">All products in stock</p>
                <p className="text-[10px] text-emerald-600 font-light mt-0.5">No products below 5 quantity limits.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 flex items-center justify-between gap-3"
                  >
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-semibold text-on-surface truncate">{p.name}</h4>
                      <p className="text-[10px] text-on-surface-variant font-mono font-light truncate mt-0.5">SKU: {p.sku}</p>
                    </div>
                    <span className="shrink-0 inline-flex items-center justify-center px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md border border-rose-200">
                      {p.quantity} left
                    </span>
                  </div>
                ))}
                <Link
                  href="/admin/products"
                  className="text-xs text-center text-primary font-bold hover:text-primary-container border border-outline-variant/30 hover:bg-surface-container-lowest/30 rounded-xl py-2 mt-2 transition-all block"
                >
                  Manage Product Stock
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-xs p-5 flex flex-col gap-4">
            <h3 className="text-base font-headline font-bold text-on-surface">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/products"
                className="p-3 rounded-xl border border-outline-variant/30 hover:border-primary bg-[#FAF6F0]/30 hover:bg-white text-center flex flex-col items-center justify-center gap-1.5 hover:scale-102 hover:shadow-xs transition-all duration-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-xl">add_shopping_cart</span>
                <span className="text-[11px] font-bold text-on-surface">New Product</span>
              </Link>
              <Link
                href="/admin/categories"
                className="p-3 rounded-xl border border-outline-variant/30 hover:border-primary bg-[#FAF6F0]/30 hover:bg-white text-center flex flex-col items-center justify-center gap-1.5 hover:scale-102 hover:shadow-xs transition-all duration-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-xl">grid_view</span>
                <span className="text-[11px] font-bold text-on-surface">New Category</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
