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
    { id: 2, label: "Review", icon: "receipt_long" },
    { id: 3, label: "Confirmed", icon: "check_circle" },
  ];
  return (
    <div className="flex items-center justify-center mb-10 select-none">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentStep >= step.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface-container border-2 border-outline-variant/30 text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
            </div>
            <span
              className={`text-[10px] font-semibold tracking-wide uppercase ${
                currentStep >= step.id ? "text-primary" : "text-on-surface-variant/60"
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-3 mb-5 rounded-full transition-all duration-500 ${
                currentStep > step.id ? "bg-primary" : "bg-outline-variant/30"
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
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
        selected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-outline-variant/20 bg-white hover:border-primary/40 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-all ${
            selected ? "border-primary bg-primary" : "border-outline-variant/40"
          }`}
        >
          {selected && (
            <span className="material-symbols-outlined text-white text-[12px]">check</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-[#242926] mb-0.5 flex items-center gap-2">
            {address.full_name}
            {address.is_default && (
              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                Default
              </span>
            )}
          </p>
          <p className="text-[11px] text-on-surface-variant mb-1">{address.phone}</p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {address.address_line1}
            {address.address_line2 ? `, ${address.address_line2}` : ""}
          </p>
          <p className="text-xs text-on-surface-variant">
            {address.city}, {address.state} — {address.postal_code}
          </p>
          <p className="text-xs text-on-surface-variant">{address.country}</p>
        </div>
        <span className="material-symbols-outlined text-lg text-primary/50">location_on</span>
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
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
    "w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm text-[#242926] placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition";
  const labelClass =
    "text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-lg text-on-surface-variant">close</span>
        </button>
        <h3 className="text-lg font-headline font-bold text-[#242926] mb-5">Add New Address</h3>
        {error && (
          <div className="mb-4 px-4 py-2.5 bg-error-container text-on-error-container text-xs rounded-xl border border-error/20">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} required placeholder="Tanuj Kashyap" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="9876543210" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Address Line 1 *</label>
            <input name="address_line1" value={form.address_line1} onChange={handleChange} required placeholder="House No., Street Name" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Address Line 2</label>
            <input name="address_line2" value={form.address_line2} onChange={handleChange} placeholder="Apartment, Suite (optional)" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>City *</label>
              <input name="city" value={form.city} onChange={handleChange} required placeholder="Mumbai" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <input name="state" value={form.state} onChange={handleChange} required placeholder="Maharashtra" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>PIN Code *</label>
              <input name="postal_code" value={form.postal_code} onChange={handleChange} required placeholder="400001" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country *</label>
              <input name="country" value={form.country} onChange={handleChange} required placeholder="India" className={inputClass} />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-full py-3 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">add_location_alt</span>
                Save Address
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Order Summary Sidebar ────────────────────────────────────────────────────
function OrderSummaryCard({ summary, loading }) {
  if (loading) {
    return (
      <div className="bg-white border border-outline-variant/20 rounded-2xl p-6 shadow-xs flex flex-col gap-4 animate-pulse">
        <div className="h-5 bg-surface-container rounded w-1/2" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 bg-surface-container rounded w-1/3" />
            <div className="h-3 bg-surface-container rounded w-1/4" />
          </div>
        ))}
        <div className="h-px bg-surface-container" />
        <div className="flex justify-between">
          <div className="h-5 bg-surface-container rounded w-1/3" />
          <div className="h-5 bg-surface-container rounded w-1/4" />
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
    <div className="bg-white border border-outline-variant/20 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
      <h2 className="text-base font-headline font-bold text-[#242926] pb-3 border-b border-outline-variant/10">
        Order Summary
      </h2>
      <div className="flex flex-col gap-2.5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-center">
            <span className="text-on-surface-variant">{row.label}</span>
            {row.value === undefined ? (
              <span className="text-xs text-on-surface-variant/40 italic">—</span>
            ) : row.free ? (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                FREE
              </span>
            ) : (
              <span className={`font-semibold ${row.negative ? "text-emerald-700" : "text-[#242926]"}`}>
                {row.negative && row.value > 0 ? "-" : ""}${row.value?.toFixed(2)}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-outline-variant/10 pt-4 flex justify-between items-baseline">
        <span className="text-sm font-bold text-[#242926]">Grand Total</span>
        <span className="text-xl font-bold text-primary">${summary?.grand_total?.toFixed(2) ?? "—"}</span>
      </div>
      {summary?.shipping === 0 && (
        <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-center font-medium">
          🎉 You qualify for <strong>free shipping</strong>!
        </p>
      )}
      {summary?.shipping === 5 && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-center font-medium">
          Add ${(50 - summary.subtotal).toFixed(2)} more for free shipping
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);

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
        headers: { "Authorization": `Bearer ${token}` },
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

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  // Fetch server-side order summary
  const fetchSummary = useCallback(async () => {
    if (cart.length === 0) return;
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const items = cart.map((item) => ({ product_id: item.product_id, quantity: item.quantity }));
      const res = await fetch("/api/orders/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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

  const handleProceedToReview = () => {
    if (!selectedAddressId) return;
    setStep(2);
    fetchSummary();
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || placing) return;
    setPlacing(true);
    setOrderError(null);
    try {
      const items = cart.map((item) => ({ product_id: item.product_id, quantity: item.quantity }));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ address_id: selectedAddressId, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place order");
      setPlacedOrder(data.data);
      clearCart();
      setStep(3);
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
      {showAddModal && (
        <AddAddressModal onClose={() => setShowAddModal(false)} onSaved={handleAddressSaved} token={token} />
      )}

      <main className="flex-grow max-w-5xl mx-auto px-5 lg:px-8 pt-32 pb-24 w-full">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors mb-4">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Cart
          </Link>
          <h1 className="text-3xl font-headline font-bold text-[#242926]">Checkout</h1>
        </div>

        <StepIndicator currentStep={step} />

        {/* ── STEP 1: Address ──────────────────────────────────────────── */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <div className="bg-white border border-outline-variant/20 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-headline font-bold text-[#242926]">Delivery Address</h2>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>Add New
                  </button>
                </div>

                {addressLoading ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2].map((i) => <div key={i} className="h-24 bg-surface-container animate-pulse rounded-2xl" />)}
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="py-10 text-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">location_off</span>
                    <p className="text-sm text-on-surface-variant mb-4">No addresses saved yet.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/90 transition-all shadow-sm"
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
                onClick={handleProceedToReview}
                disabled={!selectedAddressId}
                className="mt-5 w-full py-4 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary/90 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">receipt_long</span>
                Review Order
              </button>
            </div>

            {/* Cart preview */}
            <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 shadow-xs">
              <h2 className="text-sm font-headline font-bold text-[#242926] mb-4">Your Items ({cart.length})</h2>
              <div className="flex flex-col gap-3">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container-low flex-shrink-0 border border-outline-variant/10">
                      <img
                        src={item.thumbnailUrl || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=200"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#242926] truncate">{item.name}</p>
                      <p className="text-[11px] text-on-surface-variant">{item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                    <p className="text-xs font-bold text-[#242926] flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Review ───────────────────────────────────────────── */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Selected Address */}
              {(() => {
                const addr = addresses.find((a) => a.id === selectedAddressId);
                return addr ? (
                  <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-headline font-bold text-[#242926]">Delivering to</h2>
                      <button onClick={() => setStep(1)} className="text-xs font-semibold text-primary hover:underline">
                        Change
                      </button>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-xl mt-0.5">location_on</span>
                      <div>
                        <p className="text-sm font-bold text-[#242926]">{addr.full_name}</p>
                        <p className="text-[11px] text-on-surface-variant mb-0.5">{addr.phone}</p>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""},{" "}
                          {addr.city}, {addr.state} — {addr.postal_code}, {addr.country}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Items */}
              <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 shadow-xs">
                <h2 className="text-sm font-headline font-bold text-[#242926] mb-4">Items in your order</h2>
                <div className="flex flex-col divide-y divide-outline-variant/10">
                  {(summary?.items || cart).map((item) => (
                    <div key={item.product_id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#242926] truncate">
                          {item.name || item.product_name}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Qty: {item.quantity} x ${(item.price || item.product_price)?.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-[#242926] flex-shrink-0">
                        ${(item.total_price || (item.price || item.product_price) * item.quantity)?.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Errors */}
              {summaryError && (
                <div className="px-4 py-3 bg-error-container text-on-error-container text-sm rounded-2xl border border-error/20">
                  <p className="font-semibold mb-1">Could not load order summary</p>
                  <p className="text-xs">{summaryError}</p>
                  <button onClick={fetchSummary} className="mt-2 text-xs font-bold underline">Retry</button>
                </div>
              )}
              {orderError && (
                <div className="px-4 py-3 bg-error-container text-on-error-container text-sm rounded-2xl border border-error/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {orderError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border-2 border-outline-variant/30 text-on-surface-variant font-bold text-sm rounded-full hover:border-primary/40 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing || summaryLoading || !!summaryError}
                  className="flex-[2] py-4 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                >
                  {placing ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">shopping_bag</span>
                      Place Order
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant/60 text-center">
                All prices are calculated securely on our servers.
              </p>
            </div>

            <OrderSummaryCard summary={summary} loading={summaryLoading} />
          </div>
        )}

        {/* ── STEP 3: Confirmed ────────────────────────────────────────── */}
        {step === 3 && placedOrder && (
          <div className="max-w-lg mx-auto text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-primary/5">
              <span className="material-symbols-outlined text-5xl text-primary">check_circle</span>
            </div>
            <h2 className="text-2xl font-headline font-bold text-[#242926] mb-2">Order Placed! 🌿</h2>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Thank you! We will start preparing your herbal products right away.
            </p>

            <div className="bg-white border border-outline-variant/20 rounded-2xl p-6 shadow-xs text-left mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Order Number</p>
                  <p className="font-bold text-[#242926] font-mono text-xs">{placedOrder.order_number || `#${placedOrder.id}`}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Status</p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                    {placedOrder.status || "Pending"}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Amount Paid</p>
                  <p className="font-bold text-primary text-base">
                    ${parseFloat(placedOrder.total_amount || placedOrder.grand_total || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Placed On</p>
                  <p className="font-semibold text-[#242926]">
                    {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="flex-1 py-3.5 border-2 border-outline-variant/30 text-on-surface-variant font-bold text-sm rounded-full hover:border-primary/40 transition-all text-center">
                Continue Shopping
              </Link>
              <Link href="/" className="flex-1 py-3.5 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary/90 transition-all shadow-md text-center">
                Track My Order
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
