"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function FeaturedProducts() {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products");
        if (response.data && response.data.success && response.data.data.length > 0) {
          const formatted = response.data.data.slice(0, 12).map((apiProd) => {
            return {
              id: apiProd.id,
              name: apiProd.name,
              categoryName: apiProd.category?.name || "Botanical",
              price: parseFloat(apiProd.price) || 0.00,
              rating: 5.0,
              reviewsCount: 18,
              thumbnailUrl: apiProd.thumbnail_url || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600",
              description: apiProd.short_description || apiProd.description || "",
            };
          });
          setProducts(formatted);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to load products from API:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product || addingId === productId) return;

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

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-white font-['Inter',sans-serif]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <div className="h-8 sm:h-10 bg-[#F5F8F6] rounded w-48 sm:w-64 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-[#F5F8F6] rounded-xl animate-pulse">
                <div className="h-48 sm:h-56 rounded-t-xl"></div>
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="h-4 bg-[#E8EDEA] rounded w-3/4"></div>
                  <div className="h-4 bg-[#E8EDEA] rounded w-1/4"></div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-8 bg-[#E8EDEA] rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0D5C2F]">
              Featured Products
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7A75] mt-1 sm:mt-2">
              Handpicked just for you
            </p>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#2C3E37] hover:text-[#1E2D27] transition-colors duration-300 self-start sm:self-auto"
          >
            View All Products
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-sm text-[#6B7A75]">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="group bg-white rounded-xl border border-[#E8EDEA] overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Product Thumbnail */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-[#F5F8F6]">
                  <img
                    src={prod.thumbnailUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Category Badge */}
                  <span className="absolute top-3 left-3 text-[9px] sm:text-[10px] font-medium tracking-wide uppercase bg-white/95 text-[#2C3E37] px-2.5 py-1 rounded-md shadow-sm">
                    {prod.categoryName}
                  </span>
                  
                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(prod.id)}
                    className={`absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer ${
                      isInWishlist(prod.id)
                        ? "text-red-500 opacity-100"
                        : "text-[#6B7A75] hover:text-red-500 opacity-0 group-hover:opacity-100"
                    }`}
                    aria-label={isInWishlist(prod.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={isInWishlist(prod.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {/* Quick action overlay on hover */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      href={`/product/${prod.id}`}
                      className="w-full py-2 bg-white/95 text-[#242926] text-xs font-medium rounded-lg text-center hover:bg-white transition-colors block"
                    >
                      Quick View
                    </Link>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  {/* Product Name & Price in same row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm sm:text-base font-medium text-[#242926] line-clamp-2 flex-1 group-hover:text-[#2C3E37] transition-colors">
                      {prod.name}
                    </h3>
                    <span className="text-base sm:text-lg font-light text-[#242926] whitespace-nowrap flex-shrink-0">
                      ₹{prod.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[#F0F3F1]">
                    <Link
                      href={`/product/${prod.id}`}
                      className="flex-1 py-2 px-3 bg-[#F5F8F6] text-[#242926] text-xs font-medium rounded-lg text-center hover:bg-[#E8EDEA] transition-colors"
                    >
                      View Product
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(prod.id)}
                      disabled={addingId === prod.id}
                      className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 min-w-[80px] ${
                        addedIds[prod.id]
                          ? "bg-[#F0F3F1] text-[#2C3E37]"
                          : "bg-[#2C3E37] text-white hover:bg-[#1E2D27] hover:shadow-sm disabled:opacity-60"
                      }`}
                    >
                      {addingId === prod.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : addedIds[prod.id] ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          Added
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}