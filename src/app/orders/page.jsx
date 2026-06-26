
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  CheckCircle,
  Truck,
  MapPin,
  XCircle,
  Clock,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  PackageCheck,
  Receipt,
} from "lucide-react";

// ─── Order Status Configuration ──────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: {
    color: "amber",
    icon: Clock,
    label: "Pending",
    step: 0,
    description: "Order received, awaiting confirmation",
  },
  CONFIRMED: {
    color: "blue",
    icon: CheckCircle,
    label: "Confirmed",
    step: 1,
    description: "Order confirmed and verified",
  },
  PROCESSING: {
    color: "indigo",
    icon: Package,
    label: "Processing",
    step: 2,
    description: "Preparing your order for shipment",
  },
  SHIPPED: {
    color: "violet",
    icon: Truck,
    label: "Shipped",
    step: 3,
    description: "Order has been dispatched",
  },
  OUT_FOR_DELIVERY: {
    color: "teal",
    icon: MapPin,
    label: "Out for Delivery",
    step: 4,
    description: "Your order is on the way!",
  },
  DELIVERED: {
    color: "emerald",
    icon: PackageCheck,
    label: "Delivered",
    step: 5,
    description: "Order delivered successfully",
  },
  CANCELLED: {
    color: "rose",
    icon: XCircle,
    label: "Cancelled",
    step: -1,
    description: "Order has been cancelled",
  },
};

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

// ─── Status Badge Component ──────────────────────────────────────────────────
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
  const pulse = ["PENDING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] sm:text-[11px] font-medium rounded-full border ${colorMap[config.color]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotMap[config.color]} ${pulse ? "animate-pulse" : ""}`}
      />
      {config.label}
    </span>
  );
}

// ─── Order Step Tracker ──────────────────────────────────────────────────────
const TRACKER_STEPS = [
  { id: "ordered",    label: "Ordered",    icon: ShoppingBag },
  { id: "confirmed",  label: "Confirmed",  icon: CheckCircle },
  { id: "processing", label: "Processing", icon: Package },
  { id: "shipped",    label: "Shipped",    icon: Truck },
  { id: "delivered",  label: "Delivered",  icon: PackageCheck },
];

const STATUS_TO_STEP = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
};

function OrderStepTracker({ status }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center justify-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 px-4 py-2.5 rounded-xl">
        <XCircle className="w-4 h-4" />
        <span className="text-xs font-medium">This order has been cancelled</span>
      </div>
    );
  }

  const currentStep = STATUS_TO_STEP[status] ?? 0;
  const progressPct = (currentStep / (TRACKER_STEPS.length - 1)) * 100;

  return (
    <div className="w-full [--tracker-edge:calc(10%+18px)] sm:[--tracker-edge:calc(10%+22px)]">
      <div className="relative flex justify-between items-start">
        {/* Rail */}
        <div
          className="absolute top-[18px] sm:top-[22px] h-[2px] bg-[#E8EDEA]"
          style={{ left: "var(--tracker-edge)", right: "var(--tracker-edge)" }}
        />
        {/* Active fill */}
        <div
          className="absolute top-[18px] sm:top-[22px] h-[2px] bg-[#2C3E37] transition-all duration-700 ease-in-out"
          style={{
            left: "var(--tracker-edge)",
            right: "var(--tracker-edge)",
            transform: `scaleX(${progressPct / 100})`,
            transformOrigin: "left center",
          }}
        />

        {TRACKER_STEPS.map((step, idx) => {
          const done = idx <= currentStep;
          const active = idx === currentStep;
          const Icon = step.icon;

          return (
            <div 
              key={step.id} 
              className="relative z-10 flex flex-col items-center gap-1.5 flex-1 min-w-0"
            >
              <div
                className={`
                  w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center
                  transition-all duration-500
                  ${done ? "bg-[#2C3E37] shadow-sm" : "bg-white border-2 border-[#D5DDD8]"}
                  ${active ? "ring-[3px] ring-[#2C3E37]/15 scale-105" : ""}
                `}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${done ? "text-white" : "text-[#A0ADA8]"}`} />
              </div>
              <span
                className={`text-[9px] sm:text-[10px] font-medium text-center leading-tight transition-colors duration-300 ${
                  done ? "text-[#2C3E37]" : "text-[#A0ADA8]"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Labeled Info Chip ────────────────────────────────────────────────────────
function InfoChip({ label, value, valueClass = "" }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] sm:text-[10px] font-medium text-[#9BA8A2] uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-xs sm:text-sm font-medium text-[#242926] ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Main Orders Page ─────────────────────────────────────────────────────────
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
      const url = statusFilter ? `/api/orders?status=${statusFilter}` : "/api/orders";
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setOrders(data.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [user, token, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const toggleExpand = (id) => setExpandedOrderId((prev) => (prev === id ? null : id));

  const formatPrice = (amount) => `₹${parseFloat(amount || 0).toFixed(2)}`;

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF6F0]/30 flex flex-col font-['Inter',sans-serif]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#DCE3DF] border-t-[#2C3E37] rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0]/30 text-[#242926] flex flex-col font-['Inter',sans-serif]">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 w-full">

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#6B7A75] hover:text-[#2C3E37] transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-light text-[#242926]">My Orders</h1>
              <p className="text-xs sm:text-sm text-[#6B7A75] mt-1">Track and manage your orders</p>
            </div>
            <span className="text-xs text-[#6B7A75] bg-white px-3 py-1.5 rounded-full border border-[#E8EDEA] w-fit">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          </div>
        </div>

        {/* Status Filters */}
        <div className="mb-6 sm:mb-8 flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-medium border transition-all whitespace-nowrap ${
                statusFilter === f.value
                  ? "bg-[#2C3E37] text-white border-[#2C3E37] shadow-sm"
                  : "bg-white text-[#6B7A75] border-[#E8EDEA] hover:border-[#2C3E37]/40 hover:text-[#242926]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8EDEA] p-5 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-4 bg-[#F0F3F1] rounded w-1/3" />
                  <div className="h-4 bg-[#F0F3F1] rounded w-16" />
                </div>
                <div className="h-12 bg-[#F0F3F1] rounded w-full" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-[#E8EDEA] rounded-2xl p-10 sm:p-14 text-center max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 mx-auto mb-5 bg-[#F5F8F6] rounded-full flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-[#6B7A75]" />
            </div>
            <h2 className="text-xl font-light text-[#242926] mb-2">
              {statusFilter ? "No Orders Found" : "No Orders Yet"}
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7A75] mb-7 leading-relaxed">
              {statusFilter
                ? `You don't have any ${STATUS_CONFIG[statusFilter]?.label?.toLowerCase() || statusFilter} orders.`
                : "Start shopping to see your orders here."}
            </p>
            {statusFilter ? (
              <button
                onClick={() => setStatusFilter("")}
                className="px-7 py-2.5 bg-[#2C3E37] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#1E2D27] transition-colors"
              >
                View All Orders
              </button>
            ) : (
              <Link
                href="/"
                className="inline-block px-7 py-2.5 bg-[#2C3E37] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#1E2D27] transition-colors"
              >
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          /* Orders List */
          <div className="flex flex-col gap-4 sm:gap-5">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-[#E8EDEA] shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  {/* ── Collapsed Header ── */}
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="w-full text-left p-4 sm:p-5 lg:p-6"
                  >
                    {/* Row 1: Order meta chips */}
                    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 mb-4">
                      {/* Left: order number, status, date */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                        <InfoChip
                          label="Order Number"
                          value={order.order_number || `#${order.id}`}
                          valueClass="font-mono text-[#2C3E37]"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] sm:text-[10px] font-medium text-[#9BA8A2] uppercase tracking-wider">
                            Order Status
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                        <InfoChip
                          label="Placed On"
                          value={formatDate(order.created_at)}
                        />
                      </div>

                      {/* Right: amount + chevron */}
                      <div className="hidden sm:flex items-center gap-4 sm:ml-auto">
                        <div className="flex flex-col gap-0.5 text-right">
                          <span className="text-[9px] sm:text-[10px] font-medium text-[#9BA8A2] uppercase tracking-wider">
                            Amount
                          </span>
                          <span className="text-base sm:text-lg font-semibold text-[#2C3E37]">
                            {formatPrice(order.total_amount)}
                          </span>
                        </div>
                        <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                          <ChevronDown className="w-5 h-5 text-[#9BA8A2]" />
                        </div>
                      </div>
                    </div>

                    {/* Mobile-only items + amount row */}
                    <div className="mt-4 mb-2 flex items-center justify-between gap-3 sm:hidden">
                      <InfoChip
                        label="Items"
                        value={`${order.items?.length || 0} item${(order.items?.length || 0) !== 1 ? "s" : ""}`}
                      />
                      <div className="flex items-center gap-2 ml-auto">
                        <div className="flex flex-col gap-0.5 text-right">
                          <span className="text-[9px] font-medium text-[#9BA8A2] uppercase tracking-wider">
                            Amount
                          </span>
                          <span className="text-sm font-semibold text-[#2C3E37]">
                            {formatPrice(order.total_amount)}
                          </span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-[#9BA8A2] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>

                    {/* Row 2: Step Tracker */}
                    <div className="mt-4 sm:mt-5">
                      <OrderStepTracker status={order.status} />
                    </div>
                  </button>

                  {/* ── Expanded Details ── */}
                  {isExpanded && (
                    <div className="border-t border-[#F0F3F1] px-4 sm:px-5 lg:px-6 pb-5 sm:pb-6 pt-4">

                      {/* Items Ordered */}
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#6B7A75]" />
                          <p className="text-[10px] sm:text-[11px] font-semibold text-[#6B7A75] uppercase tracking-wider">
                            Items Ordered
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#EDF0EE] overflow-hidden">
                          {/* Table header */}
                          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 items-center px-4 py-2.5 bg-[#F8FAF9] border-b border-[#EDF0EE]">
                            <span className="text-[10px] font-semibold text-[#9BA8A2] uppercase tracking-wider col-span-2">Product</span>
                            <span className="text-[10px] font-semibold text-[#9BA8A2] uppercase tracking-wider text-right">Price</span>
                            <span className="text-[10px] font-semibold text-[#9BA8A2] uppercase tracking-wider text-center">Qty</span>
                            <span className="text-[10px] font-semibold text-[#9BA8A2] uppercase tracking-wider text-right">Total</span>
                          </div>

                          {/* Items */}
                          {order.items?.map((item, idx) => (
                            <div
                              key={item.id}
                              className={`flex items-center gap-3 sm:gap-4 px-4 py-3.5 ${
                                idx !== order.items.length - 1 ? "border-b border-[#EDF0EE]" : ""
                              }`}
                            >
                              {/* Thumbnail */}
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-[#F5F8F6] border border-[#E8EDEA] flex-shrink-0">
                                <img
                                  src={
                                    item.product?.thumbnail_url ||
                                    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=200"
                                  }
                                  alt={item.product_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Name + SKU */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-[#242926] truncate">
                                  {item.product_name}
                                </p>
                                {item.product?.sku && (
                                  <p className="text-[9px] sm:text-[10px] text-[#9BA8A2] mt-0.5 font-mono">
                                    SKU: {item.product.sku}
                                  </p>
                                )}
                                {/* Mobile-only: price × qty */}
                                <p className="text-[10px] text-[#6B7A75] mt-1 sm:hidden">
                                  {formatPrice(item.product_price)} × {item.quantity} ={" "}
                                  <span className="font-semibold text-[#2C3E37]">
                                    {formatPrice(item.total_price)}
                                  </span>
                                </p>
                              </div>

                              {/* Desktop columns */}
                              <span className="hidden sm:block text-xs sm:text-sm text-[#6B7A75] text-right w-20 flex-shrink-0">
                                {formatPrice(item.product_price)}
                              </span>
                              <span className="hidden sm:flex w-10 flex-shrink-0 items-center justify-center">
                                <span className="text-xs sm:text-sm font-medium text-[#242926] bg-[#F5F8F6] border border-[#E8EDEA] rounded-md px-2 py-0.5">
                                  ×{item.quantity}
                                </span>
                              </span>
                              <span className="hidden sm:block text-xs sm:text-sm font-semibold text-[#2C3E37] text-right w-20 flex-shrink-0">
                                {formatPrice(item.total_price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Breakdown + Delivery Address */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                        {/* Price Breakdown */}
                        <div className="bg-[#F8FAF9] rounded-xl p-4 sm:p-5 border border-[#EDF0EE]">
                          <div className="flex items-center gap-2 mb-3">
                            <Receipt className="w-3.5 h-3.5 text-[#6B7A75]" />
                            <p className="text-[10px] sm:text-[11px] font-semibold text-[#6B7A75] uppercase tracking-wider">
                              Price Breakdown
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-[#6B7A75]">Subtotal</span>
                              <span className="text-xs font-medium text-[#242926]">
                                {formatPrice(order.subtotal)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-[#6B7A75]">Shipping</span>
                              {parseFloat(order.shipping_charge) === 0 ? (
                                <span className="text-xs font-medium text-emerald-600">FREE</span>
                              ) : (
                                <span className="text-xs font-medium text-[#242926]">
                                  {formatPrice(order.shipping_charge)}
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-[#6B7A75]">GST</span>
                              <span className="text-xs font-medium text-[#242926]">
                                {formatPrice(order.gst)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-2.5 mt-0.5 border-t border-[#E2E8E4]">
                              <span className="text-sm font-semibold text-[#242926]">Total Paid</span>
                              <span className="text-sm font-bold text-[#2C3E37]">
                                {formatPrice(order.total_amount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Address */}
                        {order.address && (
                          <div className="bg-[#F8FAF9] rounded-xl p-4 sm:p-5 border border-[#EDF0EE]">
                            <div className="flex items-center gap-2 mb-3">
                              <MapPin className="w-3.5 h-3.5 text-[#6B7A75]" />
                              <p className="text-[10px] sm:text-[11px] font-semibold text-[#6B7A75] uppercase tracking-wider">
                                Delivery Address
                              </p>
                            </div>
                            <div className="flex flex-col gap-0.5 text-xs text-[#6B7A75] leading-relaxed">
                              <p className="font-semibold text-[#242926] text-sm">
                                {order.address.full_name}
                              </p>
                              <p>{order.address.phone}</p>
                              <p className="mt-1">
                                {order.address.address_line1}
                                {order.address.address_line2
                                  ? `, ${order.address.address_line2}`
                                  : ""}
                              </p>
                              <p>
                                {order.address.city}, {order.address.state}{" "}
                                — {order.address.postal_code}
                              </p>
                              <p>{order.address.country}</p>
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
