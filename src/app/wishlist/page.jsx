"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { wishlist, removeFromWishlist, loading: wishlistLoading } = useWishlist();
  const { addToCart } = useCart();

  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/wishlist");
    }
  }, [authLoading, user, router]);

  const handleAddToCart = (product) => {
    const productId = product.id.toString();
    if (addingId === productId) return;
    setAddingId(productId);
    addToCart(product, 1);

    setTimeout(() => {
      setAddingId(null);
      setAddedIds((prev) => ({ ...prev, [productId]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [productId]: false }));
      }, 2000);
    }, 600);
  };

  const handleRemove = async (wishlistId) => {
    await removeFromWishlist(wishlistId);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF6F0]/30 flex flex-col font-['Inter',sans-serif]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-[#2C3E37] animate-spin">progress_activity</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0]/30 text-[#242926] flex flex-col font-['Inter',sans-serif]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 w-full">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7A75] hover:text-[#2C3E37] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-light text-[#242926] mt-2">
            My Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7A75] mt-1">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {/* Loading Wishlist State */}
        {wishlistLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E8EDEA] overflow-hidden animate-pulse">
                <div className="h-48 sm:h-56 bg-[#F5F8F6]"></div>
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="h-4 bg-[#E8EDEA] rounded w-3/4"></div>
                  <div className="h-4 bg-[#E8EDEA] rounded w-1/4"></div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-[#E8EDEA] rounded flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 sm:py-24 bg-white rounded-2xl border border-[#E8EDEA] p-8 shadow-xs flex flex-col items-center max-w-md mx-auto mt-8">
            <div className="w-16 h-16 rounded-full bg-[#F5F8F6] text-[#2C3E37] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
            </div>
            <h2 className="text-lg font-medium text-[#242926]">Your wishlist is empty</h2>
            <p className="text-sm text-[#6B7A75] mt-2 mb-6 max-w-xs">
              Explore our curated botanical remedies and add your favorites here.
            </p>
            <Link
              href="/"
              className="px-6 py-2.5 bg-[#2C3E37] text-white text-xs font-medium rounded-full hover:bg-[#1E2D27] transition-all shadow-sm active:scale-95"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map((item) => {
              const prod = item.product;
              if (!prod) return null;
              
              const wishlistId = item.id.toString();
              const productId = prod.id.toString();
              const formattedPrice = parseFloat(prod.price) || 0.00;

              return (
                <div
                  key={wishlistId}
                  className="group bg-white rounded-xl border border-[#E8EDEA] overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {/* Product Thumbnail */}
                  <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-[#F5F8F6]">
                    <img
                      src={prod.thumbnail_url || (prod.images && prod.images[0]?.image_url) || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600"}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Category Badge */}
                    {prod.category && (
                      <span className="absolute top-3 left-3 text-[9px] sm:text-[10px] font-medium tracking-wide uppercase bg-white/95 text-[#2C3E37] px-2.5 py-1 rounded-md shadow-sm">
                        {prod.category.name}
                      </span>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(wishlistId)}
                      className="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 shadow-sm text-[#6B7A75] hover:text-red-500 flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
                      aria-label="Remove from wishlist"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-sm sm:text-base font-medium text-[#242926] line-clamp-2 flex-1 group-hover:text-[#2C3E37] transition-colors">
                        {prod.name}
                      </h3>
                      <span className="text-base sm:text-lg font-light text-[#242926] whitespace-nowrap flex-shrink-0">
                        ₹{formattedPrice.toFixed(2)}
                      </span>
                    </div>

                    {prod.short_description && (
                      <p className="text-xs text-[#6B7A75] line-clamp-2 mb-4 flex-grow">
                        {prod.short_description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[#F0F3F1]">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(prod)}
                        disabled={addingId === productId}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 ${
                          addedIds[productId]
                            ? "bg-[#F0F3F1] text-[#2C3E37]"
                            : "bg-[#2C3E37] text-white hover:bg-[#1E2D27] hover:shadow-sm disabled:opacity-60 cursor-pointer"
                        }`}
                      >
                        {addingId === productId ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : addedIds[productId] ? (
                          <>
                            <span className="material-symbols-outlined text-sm font-bold">check</span>
                            Added to Cart
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">shopping_bag</span>
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
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
