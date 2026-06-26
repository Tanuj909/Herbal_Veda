"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low text-sm text-[#242926] placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition";
const labelClass =
  "text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block";

// ─── Address Form Modal ───────────────────────────────────────────────────────
function AddressFormModal({ onClose, onSaved, editAddress, token }) {
  const isEdit = !!editAddress;
  const [form, setForm] = useState({
    full_name: editAddress?.full_name || "",
    phone: editAddress?.phone || "",
    address_line1: editAddress?.address_line1 || "",
    address_line2: editAddress?.address_line2 || "",
    city: editAddress?.city || "",
    state: editAddress?.state || "",
    postal_code: editAddress?.postal_code || "",
    country: editAddress?.country || "India",
    is_default: editAddress?.is_default || false,
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
      const url = isEdit ? `/api/addresses/${editAddress.id}` : "/api/addresses";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save address");
      onSaved(data.data, isEdit);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-lg text-on-surface-variant">close</span>
        </button>
        <h3 className="text-lg font-headline font-bold text-[#242926] mb-5">
          {isEdit ? "Edit Address" : "Add New Address"}
        </h3>

        {error && (
          <div className="mb-4 px-4 py-2.5 bg-error-container text-on-error-container text-xs rounded-xl border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Full Name & Phone */}
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

          {/* Default checkbox */}
          <label className="flex items-center gap-2 mt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              name="is_default"
              checked={form.is_default}
              onChange={handleChange}
              className="w-4 h-4 accent-primary rounded"
            />
            <span className="text-sm font-semibold text-[#242926]">Set as default address</span>
          </label>

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
                <span className="material-symbols-outlined text-base">{isEdit ? "save" : "add_location_alt"}</span>
                {isEdit ? "Update Address" : "Save Address"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Address Page ────────────────────────────────────────────────────────
export default function AddressesPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login?redirect=/addresses");
  }, [authLoading, user, router]);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/addresses", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAddresses(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSaved = (savedAddress, isEdit) => {
    if (isEdit) {
      if (savedAddress.is_default) {
        setAddresses((prev) =>
          prev.map((a) =>
            a.id === savedAddress.id ? savedAddress : { ...a, is_default: false }
          )
        );
      } else {
        setAddresses((prev) => prev.map((a) => (a.id === savedAddress.id ? savedAddress : a)));
      }
    } else {
      if (savedAddress.is_default) {
        setAddresses((prev) => [...prev.map((a) => ({ ...a, is_default: false })), savedAddress]);
      } else {
        setAddresses((prev) => [...prev, savedAddress]);
      }
    }
    setShowModal(false);
    setEditingAddress(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (addr) => {
    setEditingAddress(addr);
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingAddress(null);
    setShowModal(true);
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

      {showModal && (
        <AddressFormModal
          onClose={() => { setShowModal(false); setEditingAddress(null); }}
          onSaved={handleSaved}
          editAddress={editingAddress}
          token={token}
        />
      )}

      <main className="flex-grow max-w-4xl mx-auto px-5 lg:px-8 pt-32 pb-24 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors mb-3">
              <span className="material-symbols-outlined text-sm">arrow_back</span>Back to Home
            </Link>
            <h1 className="text-3xl font-headline font-bold text-[#242926]">My Addresses</h1>
          </div>
          <button
            onClick={openAdd}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/90 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add Address
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-xs animate-pulse">
                <div className="h-4 bg-surface-container rounded w-1/3 mb-3" />
                <div className="h-3 bg-surface-container rounded w-2/3 mb-2" />
                <div className="h-3 bg-surface-container rounded w-1/2 mb-2" />
                <div className="h-3 bg-surface-container rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : addresses.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-outline-variant/20 rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">location_off</span>
            <h2 className="text-xl font-headline font-bold text-[#242926] mb-2">No Addresses Yet</h2>
            <p className="text-xs text-on-surface-variant font-light mb-6 leading-relaxed">
              Add your delivery addresses for a faster checkout experience.
            </p>
            <button
              onClick={openAdd}
              className="px-6 py-3 bg-primary text-white font-bold text-xs rounded-full hover:bg-primary/90 transition-all shadow-md inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">add_location_alt</span>
              Add Your First Address
            </button>
          </div>
        ) : (
          /* Address cards grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-2xl border-2 p-5 shadow-xs relative transition-all ${
                  addr.is_default ? "border-primary/40 ring-2 ring-primary/10" : "border-outline-variant/20"
                }`}
              >
                {/* Name & default badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                  <h3 className="text-sm font-bold text-[#242926]">{addr.full_name}</h3>
                  {addr.is_default && (
                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      Default
                    </span>
                  )}
                </div>

                {/* Phone */}
                <p className="text-xs text-on-surface-variant mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">call</span>
                  {addr.phone}
                </p>

                {/* Address details */}
                <p className="text-xs text-on-surface-variant leading-relaxed mb-1">
                  {addr.address_line1}
                  {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {addr.city}, {addr.state} — {addr.postal_code}
                </p>
                <p className="text-xs text-on-surface-variant mb-4">{addr.country}</p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/10">
                  <button
                    onClick={() => openEdit(addr)}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>Edit
                  </button>
                  <span className="text-outline-variant/30">|</span>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={deletingId === addr.id}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {deletingId === addr.id ? "progress_activity" : "delete"}
                    </span>
                    {deletingId === addr.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}

            {/* Add new card */}
            <button
              onClick={openAdd}
              className="rounded-2xl border-2 border-dashed border-outline-variant/30 p-5 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all min-h-[160px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl text-on-surface-variant/40">add_location_alt</span>
              <span className="text-xs font-semibold text-on-surface-variant">Add New Address</span>
            </button>
          </div>
        )}

        {/* Mobile FAB */}
        <button
          onClick={openAdd}
          className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all z-40"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </main>

      <Footer />
    </div>
  );
}
