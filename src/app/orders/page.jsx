"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";

const STATUS_CONFIG = {
  PENDING: { color: "amber", icon: "schedule", label: "Pending" },
  CONFIRMED: { color: "blue", icon: "verified", label: "Confirmed" },
  PROCESSING: { color: "indigo", icon: "inventory_2", label: "Processing" },
  SHIPPED: { color: "violet", icon: "local_shipping", label: "Shipped" },
  OUT_FOR_DELIVERY: { color: "teal", icon: "delivery_truck_speed", label: "Out for Delivery" },
  DELIVERED: { color: "emerald", icon: "check_circle", label: "Delivered" },
  CANCELLED: { color: "rose", icon: "cancel", label: "Cancelled" },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const colorMap = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const dotMap = {
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    violet: "bg-violet-500",
    teal: "bg-teal-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full border ${colorMap[config.color]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[config.color]} ${status === "PENDING" || status === "SHIPPED" || status === "OUT_FOR_DELIVERY" ? "animate-pulse" : ""}`} />
      {config.label}
    </span>
  );
}

const STATUS_FILTERS = [
  { value: "", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function OrdersPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login?redirect=/orders");
  }, [authLoading, user, router]);

  const fetchOrders = useCallback(async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const url = statusFilter
        ? `/api/orders?status=${statusFilter}`
        : "/api/orders";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setOrders(data.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [user, token, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF6F0]/30 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0]/30 text-on-surface flex flex-col font-body">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-5 lg:px-8 pt-32 pb-24 w-full">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors mb-3">
            <span className="material-symbols-outlined text-sm">arrow_back</span>Back to Home
          </Link>
          <h1 className="text-3xl font-headline font-bold text-[#242926]">My Orders</h1>
          <p className="text-sm text-on-surface-variant mt-1">Track and manage your orders</p>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                statusFilter === f.value
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-on-surface-variant border-outline-variant/30 hover:border-primary/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-xs animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-4 bg-surface-container rounded w-1/4" />
                  <div className="h-5 bg-surface-container rounded w-20" />
                </div>
                <div className="h-3 bg-surface-container rounded w-1/2 mb-2" />
                <div className="h-3 bg-surface-container rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-outline-variant/20 rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">receipt_long</span>
            <h2 className="text-xl font-headline font-bold text-[#242926] mb-2">
              {statusFilter ? "No Orders Found" : "No Orders Yet"}
            </h2>
            <p className="text-xs text-on-surface-variant font-light mb-6 leading-relaxed">
              {statusFilter
                ? `You don't have any orders with status "${STATUS_CONFIG[statusFilter]?.label || statusFilter}".`
                : "Start shopping to see your orders here."}
            </p>
            {statusFilter ? (
              <button
                onClick={() => setStatusFilter("")}
                className="px-6 py-3 bg-primary text-white font-bold text-xs rounded-full hover:bg-primary/90 transition-all shadow-md"
              >
                View All Orders
              </button>
            ) : (
              <Link
                href="/"
                className="px-6 py-3 bg-primary text-white font-bold text-xs rounded-full hover:bg-primary/90 transition-all shadow-md inline-block"
              >
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          /* Orders List */
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-outline-variant/20 shadow-xs overflow-hidden transition-all"
                >
                  {/* Order Header — always visible */}
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="w-full p-5 text-left cursor-pointer hover:bg-[#FAF6F0]/30 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                          <p className="text-sm font-bold text-[#242926] font-mono">
                            {order.order_number}
                          </p>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-on-surface-variant">
                          Placed on{" "}
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {" · "}
                          {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold text-primary">
                          ${parseFloat(order.total_amount || 0).toFixed(2)}
                        </p>
                        <span
                          className={`material-symbols-outlined text-on-surface-variant/50 transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          expand_more
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-outline-variant/10 px-5 pb-5">
                      {/* Items */}
                      <div className="mt-4 mb-4">
                        <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                          Items Ordered
                        </p>
                        <div className="flex flex-col divide-y divide-outline-variant/10">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container-low flex-shrink-0 border border-outline-variant/10">
                                <img
                                  src={
                                    item.product?.thumbnail_url ||
                                    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=200"
                                  }
                                  alt={item.product_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#242926] truncate">
                                  {item.product_name}
                                </p>
                                <p className="text-xs text-on-surface-variant">
                                  Qty: {item.quantity} × ${parseFloat(item.product_price || 0).toFixed(2)}
                                </p>
                              </div>
                              <p className="text-sm font-bold text-[#242926] flex-shrink-0">
                                ${parseFloat(item.total_price || 0).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Breakdown + Address */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Price breakdown */}
                        <div className="bg-surface-container-low rounded-xl p-4">
                          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                            Price Breakdown
                          </p>
                          <div className="flex flex-col gap-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-on-surface-variant">Subtotal</span>
                              <span className="font-semibold text-[#242926]">
                                ${parseFloat(order.subtotal || 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-on-surface-variant">Shipping</span>
                              {parseFloat(order.shipping_charge) === 0 ? (
                                <span className="font-semibold text-emerald-700">FREE</span>
                              ) : (
                                <span className="font-semibold text-[#242926]">
                                  ${parseFloat(order.shipping_charge || 0).toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-on-surface-variant">GST</span>
                              <span className="font-semibold text-[#242926]">
                                ${parseFloat(order.gst || 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between pt-1.5 border-t border-outline-variant/20 mt-1">
                              <span className="font-bold text-[#242926]">Total</span>
                              <span className="font-bold text-primary">
                                ${parseFloat(order.total_amount || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Address */}
                        {order.address && (
                          <div className="bg-surface-container-low rounded-xl p-4">
                            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                              Delivery Address
                            </p>
                            <div className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-primary text-base mt-0.5">location_on</span>
                              <div className="text-xs text-on-surface-variant leading-relaxed">
                                <p className="font-bold text-[#242926] mb-0.5">{order.address.full_name}</p>
                                <p>{order.address.phone}</p>
                                <p>
                                  {order.address.address_line1}
                                  {order.address.address_line2 ? `, ${order.address.address_line2}` : ""}
                                </p>
                                <p>
                                  {order.address.city}, {order.address.state} — {order.address.postal_code}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
