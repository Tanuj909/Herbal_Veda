"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import axios from "axios";

function ProductsContent() {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Sync category filter with query parameter from URL
  useEffect(() => {
    const categoryId = searchParams.get("category_id") || "";
    setSelectedCategory(categoryId);
  }, [searchParams]);

  // Add to cart animation states
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState({});

  // Fetch Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        if (res.data && res.data.success) {
          setCategories(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products based on search query and selected category
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const params = {};
        if (selectedCategory) params.category_id = selectedCategory;
        if (searchQuery) params.search = searchQuery;

        const res = await axios.get("/api/products", { params });
        if (res.data && res.data.success) {
          setProducts(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    // Debounce product fetching if typing search query
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory]);

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

  return (
    <div className="min-h-screen bg-[#FAF6F0]/30 text-[#242926] flex flex-col font-['Inter',sans-serif]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 w-full">
        {/* Page Title */}
        <div className="mb-6">
          {/* <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7A75] hover:text-[#2C3E37] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link> */}
          <h1 className="text-2xl sm:text-3xl font-light text-[#242926] mt-2">
            Explore Products
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7A75] mt-1">
            Experience Nature's finest botanical selection.
          </p>
        </div>

        {/* Top Filters Container */}
        <div className="bg-white border border-[#E8EDEA] p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center shadow-xs mb-8">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#6B7A75] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#E8EDEA] rounded-xl text-xs bg-white focus:outline-none focus:border-[#2C3E37]/50 placeholder:text-[#6B7A75]/50"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="w-full md:w-auto overflow-x-auto no-scrollbar py-1">
            <div className="flex gap-2 items-center min-w-max">
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === ""
                    ? "bg-[#2C3E37] text-white shadow-xs"
                    : "bg-[#F5F8F6] text-[#6B7A75] hover:bg-[#E8EDEA] hover:text-[#2C3E37]"
                }`}
              >
                All
              </button>
              {loadingCategories ? (
                <div className="h-6 bg-[#F5F8F6] w-32 rounded-full animate-pulse"></div>
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat.id.toString()}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id.toString())}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      selectedCategory === cat.id.toString()
                        ? "bg-[#2C3E37] text-white shadow-xs"
                        : "bg-[#F5F8F6] text-[#6B7A75] hover:bg-[#E8EDEA] hover:text-[#2C3E37]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Products Display */}
        {loadingProducts ? (
          /* Grid Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E8EDEA] overflow-hidden animate-pulse">
                <div className="h-48 sm:h-56 bg-[#F5F8F6]"></div>
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="h-4 bg-[#E8EDEA] rounded w-3/4"></div>
                  <div className="h-4 bg-[#E8EDEA] rounded w-1/4"></div>
                  <div className="h-8 bg-[#E8EDEA] rounded pt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty Search State */
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8EDEA] p-8 shadow-xs flex flex-col items-center max-w-sm mx-auto mt-4">
            <div className="w-14 h-14 rounded-full bg-[#F5F8F6] text-[#6B7A75] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">search_off</span>
            </div>
            <h3 className="text-base font-semibold text-[#242926]">No products found</h3>
            <p className="text-xs text-[#6B7A75] mt-1.5 text-center max-w-xs">
              We couldn't find any products matching your current criteria. Try altering your keywords or filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
              }}
              className="mt-5 px-5 py-2 border border-[#2C3E37] text-[#2C3E37] text-xs font-semibold rounded-full hover:bg-[#2C3E37] hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Products Grid matching FeaturedProducts exactly */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((prod) => {
              const productId = prod.id.toString();
              const isFav = isInWishlist(productId);
              const formattedPrice = parseFloat(prod.price) || 0.0;
              const imageUrl = prod.thumbnail_url || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600";

              return (
                <div
                  key={productId}
                  className="group bg-white rounded-xl border border-[#E8EDEA] overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {/* Product Thumbnail */}
                  <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-[#F5F8F6]">
                    <img
                      src={imageUrl}
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

                    {/* Wishlist Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(prod.id)}
                      className={`absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer ${
                        isFav
                          ? "text-red-500 opacity-100"
                          : "text-[#6B7A75] hover:text-red-500 opacity-0 group-hover:opacity-100"
                      }`}
                      aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill={isFav ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>

                    {/* Quick action overlay on hover */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link
                        href={`/product/${productId}`}
                        className="w-full py-2 bg-white/95 text-[#242926] text-xs font-medium rounded-lg text-center hover:bg-white transition-colors block"
                      >
                        Quick View
                      </Link>
                    </div>
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

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[#F0F3F1]">
                      <Link
                        href={`/product/${productId}`}
                        className="flex-1 py-2 px-3 bg-[#F5F8F6] text-[#242926] text-xs font-medium rounded-lg text-center hover:bg-[#E8EDEA] transition-colors"
                      >
                        View Product
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(prod)}
                        disabled={addingId === productId}
                        className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 min-w-[80px] cursor-pointer ${
                          addedIds[productId]
                            ? "bg-[#F0F3F1] text-[#2C3E37]"
                            : "bg-[#2C3E37] text-white hover:bg-[#1E2D27] hover:shadow-sm disabled:opacity-60"
                        }`}
                      >
                        {addingId === productId ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : addedIds[productId] ? (
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
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF6F0]/30 flex flex-col font-['Inter',sans-serif]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-[#2C3E37] animate-spin">progress_activity</span>
        </div>
        <Footer />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
