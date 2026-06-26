"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, cartSubtotal, isInitialized } = useCart();

  const handleCheckoutRedirect = () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0]/30 text-on-surface flex flex-col font-body">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24 w-full">
        <h1 className="text-3xl font-headline font-bold text-[#242926] mb-8">
          Your Shopping Cart
        </h1>

        {!isInitialized ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4">
              eco
            </span>
            <p className="text-sm text-on-surface-variant font-light">Loading your cart...</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4">
              shopping_bag
            </span>
            <h2 className="text-xl font-headline font-bold text-[#242926] mb-2">
              Your cart is empty
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant font-light mb-8 leading-relaxed max-w-xs">
              Explore nature's finest selection of organic oils, teas, and skin botanicals to fill your sanctuary.
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-primary text-[#242926] font-semibold text-xs rounded-full hover:bg-primary/95 transition-all shadow-xs"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-white border border-outline-variant/20 rounded-2xl overflow-hidden shadow-xs">
                <div className="divide-y divide-outline-variant/10">
                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-[#FAF6F0]/10"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/20 flex-shrink-0">
                          <img
                            src={item.thumbnailUrl || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=200"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Name & price */}
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base text-[#242926] mb-1">
                            {item.name}
                          </h3>
                          <p className="text-xs text-on-surface-variant font-medium">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>

                      {/* Quantity Selector & total */}
                      <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-outline-variant/40 rounded-full px-2 py-1 bg-white">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="w-10 text-center text-xs font-bold text-[#242926]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right min-w-[80px]">
                          <p className="text-sm font-bold text-[#242926]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-700 transition-colors mt-1 inline-flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[12px]">delete</span>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Summary Card */}
            <div className="bg-white border border-outline-variant/20 p-6 rounded-2xl shadow-xs flex flex-col gap-6">
              <h2 className="text-lg font-headline font-bold text-[#242926] pb-3 border-b border-outline-variant/10">
                Order Summary
              </h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#242926]">${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Shipping</span>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Calculated at Checkout
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Estimated Tax</span>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Calculated at Checkout
                  </span>
                </div>
              </div>

              <div className="border-t border-outline-variant/10 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#242926]">Subtotal to pay</span>
                <span className="text-xl font-bold text-primary-fixed-dim">${cartSubtotal.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckoutRedirect}
                className="w-full py-4 bg-primary text-[#242926] font-bold text-xs rounded-full hover:bg-primary/95 transition-all shadow-md text-center hover:scale-[1.02] active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                Proceed to Checkout
              </button>

              <p className="text-[10px] text-on-surface-variant/70 text-center font-light leading-relaxed">
                By proceeding to checkout you agree to our Terms of Service. Shipping and taxes are calculated dynamically on the server.
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
