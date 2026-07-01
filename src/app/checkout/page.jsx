"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
  const steps = [
    { id: 1, label: "Address", icon: "location_on" },
    { id: 2, label: "Payment", icon: "credit_card" },
    { id: 3, label: "Review", icon: "receipt_long" },
    { id: 4, label: "Confirmed", icon: "check_circle" },
  ];

  return (
    <div className="flex items-center justify-center mb-8 sm:mb-12 select-none px-2">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1.5 sm:gap-2">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentStep >= step.id
                  ? "bg-[#2C3E37] text-white shadow-lg"
                  : "bg-[#F5F8F6] border-2 border-[#DCE3DF] text-[#6B7A75]"
              }`}
            >
              <span className="material-symbols-outlined text-base sm:text-xl">{step.icon}</span>
            </div>
            <span
              className={`text-[10px] sm:text-xs font-medium tracking-wide ${
                currentStep >= step.id ? "text-[#2C3E37]" : "text-[#6B7A75]"
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-1 sm:mx-4 mb-5 sm:mb-6 rounded-full transition-all duration-500 ${
                currentStep > step.id ? "bg-[#2C3E37]" : "bg-[#DCE3DF]"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Address Card ─────────────────────────────────────────────────────────────
function AddressCard({ address, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(address.id)}
      className={`w-full text-left p-3 sm:p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
        selected
          ? "border-[#2C3E37] bg-[#F8FAF9] shadow-sm"
          : "border-[#E8EDEA] bg-white hover:border-[#2C3E37]/40 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-all ${
            selected ? "border-[#2C3E37] bg-[#2C3E37]" : "border-[#DCE3DF]"
          }`}
        >
          {selected && (
            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-[#242926] mb-0.5 flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="truncate">{address.full_name}</span>
            {address.is_default && (
              <span className="text-[9px] sm:text-[10px] font-medium text-[#2C3E37] bg-[#F0F3F1] px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                Default
              </span>
            )}
          </p>
          <p className="text-[10px] sm:text-xs text-[#6B7A75] mb-0.5 sm:mb-1">{address.phone}</p>
          <p className="text-[10px] sm:text-xs text-[#6B7A75] leading-relaxed break-words">
            {address.address_line1}
            {address.address_line2 ? `, ${address.address_line2}` : ""}
          </p>
          <p className="text-[10px] sm:text-xs text-[#6B7A75]">
            {address.city}, {address.state} — {address.postal_code}
          </p>
          <p className="text-[10px] sm:text-xs text-[#6B7A75]">{address.country}</p>
        </div>
      </div>
    </button>
  );
}

// ─── Add Address Modal ────────────────────────────────────────────────────────
function AddAddressModal({ onClose, onSaved, token }) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save address");
      onSaved(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-[#DCE3DF] bg-white text-sm text-[#242926] placeholder:text-[#6B7A75]/50 focus:outline-none focus:border-[#2C3E37] focus:ring-1 focus:ring-[#2C3E37]/20 transition";
  const labelClass =
    "text-[10px] sm:text-xs font-medium text-[#6B7A75] mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F8F6] transition-colors"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B7A75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-lg sm:text-xl font-light text-[#242926] mb-4 sm:mb-6">Add New Address</h3>
        {error && (
          <div className="mb-4 px-3 sm:px-4 py-2 sm:py-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Enter your full name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Enter phone number" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Address Line 1 *</label>
            <input name="address_line1" value={form.address_line1} onChange={handleChange} required placeholder="Enter address line 1" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Address Line 2</label>
            <input name="address_line2" value={form.address_line2} onChange={handleChange} placeholder="Enter address line 2 (optional)" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClass}>City *</label>
              <input name="city" value={form.city} onChange={handleChange} required placeholder="Enter city" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <input name="state" value={form.state} onChange={handleChange} required placeholder="Enter state" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelClass}>PIN Code *</label>
              <input name="postal_code" value={form.postal_code} onChange={handleChange} required placeholder="Enter postal code" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country *</label>
              <input name="country" value={form.country} onChange={handleChange} required placeholder="Enter country" className={inputClass} />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-full py-2.5 sm:py-3 bg-[#2C3E37] text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-[#1E2D27] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>Save Address</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Order Summary Sidebar ────────────────────────────────────────────────────
function OrderSummaryCard({ summary, loading }) {
  // Improved formatPrice function to handle various data types
  const formatPrice = (amount) => {
    // If amount is null, undefined, or not a number, return 0.00
    if (amount === null || amount === undefined || isNaN(amount)) {
      return `₹0.00`;
    }
    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    // Check if it's a valid number after conversion
    if (isNaN(numAmount)) {
      return `₹0.00`;
    }
    return `₹${numAmount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#E8EDEA] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-3 sm:gap-4 animate-pulse">
        <div className="h-5 bg-[#F5F8F6] rounded w-1/2" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 bg-[#F5F8F6] rounded w-1/3" />
            <div className="h-3 bg-[#F5F8F6] rounded w-1/4" />
          </div>
        ))}
        <div className="h-px bg-[#F5F8F6]" />
        <div className="flex justify-between">
          <div className="h-5 bg-[#F5F8F6] rounded w-1/3" />
          <div className="h-5 bg-[#F5F8F6] rounded w-1/4" />
        </div>
      </div>
    );
  }

  const rows = [
    { label: "Subtotal", value: summary?.subtotal },
    { label: "Shipping", value: summary?.shipping, free: summary?.shipping === 0 },
    { label: "GST", value: summary?.gst ?? summary?.tax },
    { label: "Discount", value: summary?.discount, negative: true },
  ];

  return (
    <div className="bg-white border border-[#E8EDEA] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-3 sm:gap-4">
      <h2 className="text-base sm:text-lg font-medium text-[#242926] pb-3 sm:pb-4 border-b border-[#E8EDEA]">
        Order Summary
      </h2>
      <div className="flex flex-col gap-2 sm:gap-3 text-xs sm:text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-center">
            <span className="text-[#6B7A75]">{row.label}</span>
            {row.value === undefined || row.value === null ? (
              <span className="text-[10px] sm:text-xs text-[#6B7A75]/40">—</span>
            ) : row.free ? (
              <span className="text-[10px] sm:text-xs font-medium text-[#2C3E37] bg-[#F0F3F1] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                FREE
              </span>
            ) : (
              <span className={`font-medium ${row.negative ? "text-[#2C3E37]" : "text-[#242926]"}`}>
                {row.negative && row.value > 0 ? "-" : ""}{formatPrice(row.value)}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-[#E8EDEA] pt-3 sm:pt-4 flex justify-between items-baseline">
        <span className="text-xs sm:text-sm font-medium text-[#6B7A75]">Total</span>
        <span className="text-lg sm:text-xl font-light text-[#242926]">{formatPrice(summary?.grand_total)}</span>
      </div>
      {summary?.shipping === 0 && (
        <p className="text-[10px] sm:text-xs text-[#2C3E37] bg-[#F0F3F1] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-center">
          🎉 You qualify for <strong>free shipping</strong> on orders of ₹1000 or more!
        </p>
      )}
      {summary?.shipping === 50 && (
        <p className="text-[10px] sm:text-xs text-[#8B7D3C] bg-[#F9F6ED] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-center">
          Add {formatPrice(1000 - summary.subtotal)} more to get free shipping
        </p>
      )}
    </div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { cart, clearCart, isInitialized } = useCart();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showAddModal, setShowAddModal] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);

  // Improved formatPrice function to handle various data types
  const formatPrice = (amount) => {
    // If amount is null, undefined, or not a number, return 0.00
    if (amount === null || amount === undefined || isNaN(amount)) {
      return `₹0.00`;
    }
    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    // Check if it's a valid number after conversion
    if (isNaN(numAmount)) {
      return `₹0.00`;
    }
    return `₹${numAmount.toFixed(2)}`;
  };

  // Guards
  useEffect(() => {
    if (isInitialized && !user) router.push("/login?redirect=/checkout");
    if (isInitialized && cart.length === 0 && !placedOrder) router.push("/cart");
  }, [isInitialized, user, cart, router, placedOrder]);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    setAddressLoading(true);
    try {
      const res = await fetch("/api/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(data.data || []);
        if (data.data?.length > 0) {
          const defaultAddr = data.data.find((a) => a.is_default);
          setSelectedAddressId(defaultAddr ? defaultAddr.id : data.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddressLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Fetch server-side order summary
  const fetchSummary = useCallback(async () => {
    if (cart.length === 0) return;
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const items = cart.map((item) => ({ product_id: item.product_id, quantity: item.quantity }));
      const res = await fetch("/api/orders/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch summary");
      setSummary(data.data);
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  }, [cart]);

  const handleProceedToPayment = () => {
    if (!selectedAddressId) return;
    setStep(2);
  };

  const handleProceedToReview = async () => {
    if (!selectedAddressId) return;
    setStep(3);
    await fetchSummary();
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(true), { once: true });
        existing.addEventListener("error", () => resolve(false), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const verifyRazorpayPayment = async (response) => {
    const res = await fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(response),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Payment verification failed");
    }
    return data.data;
  };

  const openRazorpayCheckout = async (payload) => {
    const ready = await loadRazorpayScript();
    if (!ready) {
      throw new Error("Unable to load Razorpay checkout");
    }

    const options = {
      key: payload.key_id,
      amount: payload.razorpay_order.amount,
      currency: payload.razorpay_order.currency,
      name: "The Herbal Veda",
      description: `Order ${payload.order.order_number}`,
      order_id: payload.razorpay_order.id,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || "",
      },
      theme: { color: "#2C3E37" },
      modal: {
        ondismiss: () => {
          setPaymentError("Payment window closed. You can retry payment.");
        },
      },
      handler: async (response) => {
        try {
          const verifiedOrder = await verifyRazorpayPayment(response);
          setPlacedOrder(verifiedOrder);
          clearCart();
          setPendingPayment(null);
          setStep(4);
        } catch (error) {
          setPaymentError(error.message);
        }
      },
    };

    const checkout = new window.Razorpay(options);
    checkout.on("payment.failed", (failure) => {
      setPaymentError(failure?.error?.description || "Payment failed. Please retry.");
    });
    checkout.open();
  };

  const startOnlinePayment = async () => {
    if (!selectedAddressId || placing) return;
    setPlacing(true);
    setOrderError(null);
    setPaymentError(null);

    try {
      const items = cart.map((item) => ({ product_id: item.product_id, quantity: item.quantity }));
      const intentRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ address_id: selectedAddressId, items }),
      });
      const intentData = await intentRes.json();
      if (!intentRes.ok) {
        throw new Error(intentData.message || "Failed to create Razorpay order");
      }

      const payload = intentData.data;
      setPendingPayment(payload);
      await openRazorpayCheckout(payload);
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || placing) return;
    setOrderError(null);

    if (paymentMethod === "ONLINE") {
      setPaymentError(null);
      if (pendingPayment?.razorpay_order) {
        await openRazorpayCheckout(pendingPayment);
        return;
      }
      await startOnlinePayment();
      return;
    }

    setPlacing(true);
    try {
      const items = cart.map((item) => ({ product_id: item.product_id, quantity: item.quantity }));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ address_id: selectedAddressId, items, payment_method: "COD" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place order");
      setPlacedOrder(data.data);
      clearCart();
      setStep(4);
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  const handleAddressSaved = (newAddress) => {
    setAddresses((prev) => [...prev, newAddress]);
    setSelectedAddressId(newAddress.id);
    setShowAddModal(false);
  };

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-[#FAF6F0]/30 flex flex-col font-['Inter',sans-serif]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-[#DCE3DF] border-t-[#2C3E37] rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0]/30 text-[#242926] flex flex-col font-['Inter',sans-serif]">
      <Navbar />
      {showAddModal && (
        <AddAddressModal onClose={() => setShowAddModal(false)} onSaved={handleAddressSaved} token={token} />
      )}

      <main className="flex-grow max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24 w-full">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <Link href="/cart" className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#6B7A75] hover:text-[#2C3E37] transition-colors mb-3 sm:mb-4">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Cart
          </Link>
          <h1 className="text-2xl sm:text-3xl font-light text-[#242926]">Checkout</h1>
        </div>

        <StepIndicator currentStep={step} />

        {/* ── STEP 1: Address ──────────────────────────────────────────── */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            <div className="lg:col-span-2">
              <div className="bg-white border border-[#E8EDEA] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-light text-[#242926]">Delivery Address</h2>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium text-[#2C3E37] hover:text-[#1E2D27] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add New
                  </button>
                </div>

                {addressLoading ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-20 sm:h-24 bg-[#F5F8F6] animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="py-8 sm:py-12 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-[#F5F8F6] rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#6B7A75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm text-[#6B7A75] mb-3 sm:mb-4">No addresses saved yet.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#2C3E37] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#1E2D27] transition-colors shadow-sm"
                    >
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        selected={selectedAddressId === addr.id}
                        onSelect={setSelectedAddressId}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!selectedAddressId}
                className="mt-4 sm:mt-6 w-full py-3 sm:py-4 bg-[#2C3E37] text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-[#1E2D27] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Choose Payment Method
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Cart preview */}
            <div className="bg-white border border-[#E8EDEA] rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-light text-[#242926] mb-3 sm:mb-4">Your Items ({cart.length})</h2>
              <div className="flex flex-col gap-2 sm:gap-3">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-[#F5F8F6] flex-shrink-0 border border-[#E8EDEA]">
                      <img
                        src={item.thumbnailUrl || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=200"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-[#242926] truncate">{item.name}</p>
                      <p className="text-[10px] sm:text-xs text-[#6B7A75]">{item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-[#242926] flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Payment ──────────────────────────────────────────── */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
              {(() => {
                const addr = addresses.find((a) => a.id === selectedAddressId);
                return addr ? (
                  <div className="bg-white border border-[#E8EDEA] rounded-2xl p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h2 className="text-base sm:text-lg font-light text-[#242926]">Delivering to</h2>
                      <button onClick={() => setStep(1)} className="text-xs sm:text-sm font-medium text-[#2C3E37] hover:text-[#1E2D27] transition-colors">
                        Change
                      </button>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C3E37] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#242926]">{addr.full_name}</p>
                        <p className="text-[10px] sm:text-xs text-[#6B7A75] mb-0.5">{addr.phone}</p>
                        <p className="text-[10px] sm:text-xs text-[#6B7A75] leading-relaxed break-words">
                          {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""},{" "}
                          {addr.city}, {addr.state} — {addr.postal_code}, {addr.country}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              <div className="bg-white border border-[#E8EDEA] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-4 sm:gap-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-light text-[#242926]">Choose Payment Method</h2>
                    <p className="text-[10px] sm:text-xs text-[#6B7A75] mt-1">Select how you&apos;d like to pay for this order.</p>
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-[#2C3E37] bg-[#F0F3F1] px-2.5 py-1 rounded-full">
                    {paymentMethod}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "COD", title: "Cash on Delivery", description: "Pay when the order arrives." },
                    { id: "ONLINE", title: "Online Payment", description: "Pay securely with Razorpay." },
                  ].map((method) => {
                    const active = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          active
                            ? "border-[#2C3E37] bg-[#F8FAF9] shadow-sm"
                            : "border-[#E8EDEA] bg-white hover:border-[#2C3E37]/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex-shrink-0 ${active ? "border-[#2C3E37] bg-[#2C3E37]" : "border-[#DCE3DF]"}`} />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-[#242926]">{method.title}</p>
                            <p className="text-[10px] sm:text-xs text-[#6B7A75] mt-0.5">{method.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {paymentError && (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-xl border border-red-200">
                    <p className="font-medium mb-1">Payment issue</p>
                    <p className="text-[10px] sm:text-xs">{paymentError}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="sm:flex-1 py-3 sm:py-4 border-2 border-[#DCE3DF] text-[#6B7A75] font-medium text-xs sm:text-sm rounded-lg hover:border-[#2C3E37]/40 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                  </button>
                  <button
                    onClick={handleProceedToReview}
                    disabled={!selectedAddressId}
                    className="sm:flex-[2] py-3 sm:py-4 bg-[#2C3E37] text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-[#1E2D27] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continue to Summary
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E8EDEA] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-3">
              <h2 className="text-base sm:text-lg font-light text-[#242926]">Next Step</h2>
              <p className="text-xs sm:text-sm text-[#6B7A75] leading-relaxed">
                After you choose a payment method, we’ll calculate the final summary on the next screen and let you place the order.
              </p>
              <div className="rounded-xl bg-[#F8FAF9] border border-[#EDF0EE] px-3 py-2 text-[10px] sm:text-xs text-[#6B7A75]">
                {paymentMethod === "ONLINE" ? "Online payment will open Razorpay checkout." : "COD will create the order directly."}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review ───────────────────────────────────────────── */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
              {(() => {
                const addr = addresses.find((a) => a.id === selectedAddressId);
                return addr ? (
                  <div className="bg-white border border-[#E8EDEA] rounded-2xl p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h2 className="text-base sm:text-lg font-light text-[#242926]">Delivering to</h2>
                      <button onClick={() => setStep(1)} className="text-xs sm:text-sm font-medium text-[#2C3E37] hover:text-[#1E2D27] transition-colors">
                        Change
                      </button>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C3E37] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#242926]">{addr.full_name}</p>
                        <p className="text-[10px] sm:text-xs text-[#6B7A75] mb-0.5">{addr.phone}</p>
                        <p className="text-[10px] sm:text-xs text-[#6B7A75] leading-relaxed break-words">
                          {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""},{" "}
                          {addr.city}, {addr.state} — {addr.postal_code}, {addr.country}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              <div className="bg-white border border-[#E8EDEA] rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-light text-[#242926]">Items in your order</h2>
                  <span className="text-[10px] sm:text-xs font-medium text-[#2C3E37] bg-[#F0F3F1] px-2.5 py-1 rounded-full">
                    {paymentMethod === "ONLINE" ? "Online" : "COD"}
                  </span>
                </div>
                <div className="flex flex-col divide-y divide-[#F0F3F1]">
                  {(summary?.items || cart).map((item) => (
                    <div key={item.product_id} className="flex items-center gap-2 sm:gap-3 py-3 sm:py-4 first:pt-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#242926] truncate">
                          {item.name || item.product_name}
                        </p>
                        <p className="text-[10px] sm:text-xs text-[#6B7A75]">
                          Qty: {item.quantity} × {formatPrice(item.price || item.product_price)}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-[#242926] flex-shrink-0">
                        {formatPrice(item.total_price || (item.price || item.product_price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {paymentError && (
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 text-amber-800 text-xs sm:text-sm rounded-xl border border-amber-200">
                  <p className="font-medium mb-1">Payment not completed</p>
                  <p className="text-[10px] sm:text-xs">{paymentError}</p>
                </div>
              )}
              {summaryError && (
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-xl border border-red-200">
                  <p className="font-medium mb-1">Could not load order summary</p>
                  <p className="text-[10px] sm:text-xs">{summaryError}</p>
                  <button onClick={fetchSummary} className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-medium underline">Retry</button>
                </div>
              )}
              {orderError && (
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-xl border border-red-200 flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="break-words">{orderError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="sm:flex-1 py-3 sm:py-4 border-2 border-[#DCE3DF] text-[#6B7A75] font-medium text-xs sm:text-sm rounded-lg hover:border-[#2C3E37]/40 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing || summaryLoading || !!summaryError}
                  className="sm:flex-[2] py-3 sm:py-4 bg-[#2C3E37] text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-[#1E2D27] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {placing ? (
                    <>
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {paymentMethod === "ONLINE" ? "Opening Razorpay..." : "Placing Order..."}
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      {paymentMethod === "ONLINE" ? "Pay with Razorpay" : "Place Order"}
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] sm:text-xs text-[#6B7A75]/60 text-center">
                All prices are calculated securely on our servers.
              </p>
            </div>

            <OrderSummaryCard summary={summary} loading={summaryLoading} />
          </div>
        )}

        {/* ── STEP 4: Confirmed ────────────────────────────────────────── */}
        {step === 4 && placedOrder && (
          <div className="max-w-lg mx-auto text-center px-2">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-[#F0F3F1] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ring-8 ring-[#F0F3F1]/40">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-[#2C3E37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-light text-[#242926] mb-2">Order Confirmed</h2>
              <p className="text-xs sm:text-sm text-[#6B7A75] mb-6 sm:mb-8 leading-relaxed">
              Thank you! We&apos;ll start preparing your order right away.
            </p>

            <div className="bg-white border border-[#E8EDEA] rounded-2xl p-4 sm:p-6 shadow-sm text-left mb-6 sm:mb-8">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-[#6B7A75] uppercase tracking-wider mb-0.5 sm:mb-1">Order Number</p>
                  <p className="font-medium text-[#242926] font-mono text-[10px] sm:text-sm break-words">
                    {placedOrder.order_number || `#${placedOrder.id}`}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-[#6B7A75] uppercase tracking-wider mb-0.5 sm:mb-1">Status</p>
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-[#F9F6ED] text-[#8B7D3C] text-[10px] sm:text-xs font-medium rounded-full border border-[#E8E0D0]">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#8B7D3C] animate-pulse inline-block"></span>
                    {placedOrder.status || "Pending"}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-[#6B7A75] uppercase tracking-wider mb-0.5 sm:mb-1">Amount Paid</p>
                  <p className="font-light text-[#242926] text-lg sm:text-xl">
                    {formatPrice(placedOrder.total_amount || placedOrder.grand_total || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-[#6B7A75] uppercase tracking-wider mb-0.5 sm:mb-1">Placed On</p>
                  <p className="font-medium text-[#242926] text-[10px] sm:text-sm">
                    {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="flex-1 py-3 sm:py-3.5 border-2 border-[#DCE3DF] text-[#6B7A75] font-medium text-xs sm:text-sm rounded-lg hover:border-[#2C3E37]/40 transition-colors text-center">
                Continue Shopping
              </Link>
              <Link href="/orders" className="flex-1 py-3 sm:py-3.5 bg-[#2C3E37] text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-[#1E2D27] transition-colors shadow-sm text-center">
                View Orders
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
