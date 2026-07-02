"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const ScrollReveal = ({ children, index, className = "", style = {} }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`reveal-item ${isVisible ? "reveal-active" : ""} ${className}`}
      style={{
        ...style,
        transitionDelay: isVisible ? `${(index % 4) * 80}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
};

function ProductsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const searchParams = useSearchParams();

  const handleBuyNow = async (product) => {
    if (!user) {
      router.push("/login");
      return;
    }
    await addToCart(product, 1);
    router.push("/cart");
  };

  const handleToggleWishlist = (productId) => {
    if (!user) {
      router.push("/login");
      return;
    }
    toggleWishlist(productId);
  };

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState(5000);

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
    if (!user) {
      router.push("/login");
      return;
    }
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

  const filteredProducts = products.filter((prod) => {
    const price = parseFloat(prod.price) || 0;
    return price <= maxPriceFilter;
  });

  return (
    <div className="min-h-screen bg-[#FAF6F0]/30 text-[#242926] flex flex-col font-['Inter',sans-serif]">
      <Navbar />

      <main className="flex-grow w-full px-4 sm:px-8 md:px-12 pt-24 sm:pt-28 pb-16">
        {/* Header Section */}
        <header className="mb-8">
          <span className="text-[10px] font-bold text-[#6B7A75] uppercase tracking-widest bg-[#E8EDEA]/50 px-2.5 py-1 rounded-md">
            Explore Pleasure
          </span>
          <h1 className="text-3xl sm:text-4xl font-light text-[#242926] mt-2 leading-tight">
            Explore Our Products
          </h1>
        </header>

        {/* Search Section */}
        <section className="mb-6 max-w-md">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#6B7A75] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[#E8EDEA] rounded-xl text-xs bg-white focus:outline-none focus:border-[#2C3E37] focus:ring-1 focus:ring-[#2C3E37]/20 transition-all duration-300 placeholder:text-[#6B7A75]/50 shadow-3xs"
            />
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-10 border-b border-[#E8EDEA]/60 pb-6 flex items-center gap-3">
          {/* Category Filter Pills */}
          <div className="overflow-x-auto no-scrollbar py-0.5 flex-grow">
            <div className="flex gap-2 items-center min-w-max">
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  selectedCategory === ""
                    ? "bg-[#2C3E37] text-white shadow-md shadow-[#2C3E37]/10"
                    : "bg-white text-[#6B7A75] border border-[#E8EDEA]/60 hover:border-[#2C3E37]/30 hover:text-[#2C3E37]"
                }`}
              >
                All Products
              </button>
              {loadingCategories ? (
                <div className="h-7 bg-[#F5F8F6] w-24 rounded-full animate-pulse"></div>
              ) : (
                <>
                  {categories.slice(0, 8).map((cat) => (
                    <button
                      key={cat.id.toString()}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id.toString())}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                        selectedCategory === cat.id.toString()
                          ? "bg-[#2C3E37] text-white shadow-md shadow-[#2C3E37]/10"
                          : "bg-white text-[#6B7A75] border border-[#E8EDEA]/60 hover:border-[#2C3E37]/30 hover:text-[#2C3E37]"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                  
                  {/* If selected category is outside the first 8, show it in the main view too! */}
                  {selectedCategory !== "" && !categories.slice(0, 8).some(c => c.id.toString() === selectedCategory) && (
                    (() => {
                      const selectedCat = categories.find(c => c.id.toString() === selectedCategory);
                      return selectedCat ? (
                        <button
                          key={selectedCat.id.toString()}
                          type="button"
                          onClick={() => setSelectedCategory(selectedCat.id.toString())}
                          className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer bg-[#2C3E37] text-white shadow-md shadow-[#2C3E37]/10"
                        >
                          {selectedCat.name}
                        </button>
                      ) : null;
                    })()
                  )}
                </>
              )}
            </div>
          </div>

          {/* Filter tune button (visible on all screens) */}
          <button
            type="button"
            onClick={() => setShowAllCategories(true)}
            className="w-9 h-9 rounded-xl bg-white border border-[#E8EDEA] text-[#2C3E37] hover:bg-[#F5F8F6] hover:border-[#2C3E37]/30 transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 shadow-3xs"
            aria-label="Open Filters"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </section>

        {/* Products Display */}
        {loadingProducts ? (
          /* Grid Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8EDEA] overflow-hidden animate-pulse flex flex-col">
                <div className="aspect-[4/3] w-full bg-[#F5F8F6]"></div>
                <div className="p-5 flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-[#F5F8F6] rounded w-1/4"></div>
                    <div className="h-5 bg-[#F5F8F6] rounded w-3/4"></div>
                    <div className="h-4 bg-[#F5F8F6] rounded w-1/3"></div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-[#F0F3F1]">
                    <div className="h-9 bg-[#F5F8F6] rounded-xl flex-1"></div>
                    <div className="h-9 bg-[#F5F8F6] rounded-xl w-[90px]"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty Search State */
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8EDEA] p-8 shadow-xs flex flex-col items-center max-w-sm mx-auto mt-4">
            <div className="w-14 h-14 rounded-full bg-[#F5F8F6] text-[#6B7A75] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">search_off</span>
            </div>
            <h3 className="text-base font-semibold text-[#242926]">No products found</h3>
            <p className="text-xs text-[#6B7A75] mt-1.5 text-center max-w-xs">
              We couldn't find any products matching your current criteria or price limit. Try altering your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setMaxPriceFilter(5000);
              }}
              className="mt-5 px-5 py-2 border border-[#2C3E37] text-[#2C3E37] text-xs font-semibold rounded-full hover:bg-[#2C3E37] hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((prod, index) => {
              const productId = prod.id.toString();
              const isFav = isInWishlist(productId);
              const formattedPrice = parseFloat(prod.price) || 0.0;
              const imageUrl = prod.thumbnail_url || (prod.images && prod.images[0]?.image_url) || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600";

              return (
                <ScrollReveal
                  key={productId}
                  index={index}
                >
                  <div className="group bg-white rounded-2xl border border-[#E8EDEA] overflow-hidden hover:shadow-xl hover:border-[#2C3E37]/15 transition-all duration-500 flex flex-col h-full">
                    {/* Product Thumbnail */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5F8F6] border-b border-[#F0F3F1]">
                      <img
                        src={imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Category Badge */}
                      {prod.category && (
                        <span className="absolute top-4 left-4 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md bg-white/80 text-[#2C3E37] px-2.5 py-1.5 rounded-lg shadow-xs">
                          {prod.category.name}
                        </span>
                      )}

                      {/* Wishlist Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleWishlist(prod.id)}
                        className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs shadow-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white cursor-pointer ${
                          isFav
                            ? "text-red-500 opacity-100 bg-white"
                            : "text-[#6B7A75] hover:text-red-500 opacity-0 group-hover:opacity-100"
                        }`}
                        aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <svg
                          className="w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-105"
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
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <Link
                          href={`/product/${productId}`}
                          className="w-[85%] py-2.5 bg-white/95 text-[#242926] text-xs font-semibold rounded-xl text-center hover:bg-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-sm"
                        >
                          Quick View
                        </Link>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h3 className="text-sm sm:text-base font-semibold text-[#242926] line-clamp-2 group-hover:text-[#2C3E37] transition-colors leading-snug flex-grow">
                          {prod.name}
                        </h3>
                        <span className="text-base sm:text-lg font-bold text-[#0D5C2F] whitespace-nowrap flex-shrink-0 pt-0.5">
                          ₹{formattedPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[#F0F3F1]">
                        <button
                          type="button"
                          onClick={() => handleBuyNow(prod)}
                          className="flex-1 py-2.5 px-3 bg-[#EAF2ED] text-[#0D5C2F] hover:bg-[#0D5C2F] hover:text-white text-xs font-semibold rounded-xl text-center transition-all duration-300 cursor-pointer"
                        >
                          Buy Now
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(prod)}
                          disabled={addingId === productId}
                          className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 min-w-[90px] cursor-pointer ${
                            addedIds[productId]
                              ? "bg-[#E8EDEA] text-[#2C3E37] shadow-xs"
                              : "bg-[#2C3E37] text-white hover:bg-[#1E2D27] hover:shadow-md hover:shadow-[#2C3E37]/10 disabled:opacity-60"
                          }`}
                        >
                          {addingId === productId ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : addedIds[productId] ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                              Added
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Micro-Modal for Filters & Categories */}
      {showAllCategories && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setShowAllCategories(false)}
          />
          {/* Modal Dialog */}
          <div className="relative w-full max-w-sm bg-[#FAF6F0] rounded-3xl p-6 border border-[#2C3E37]/15 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 border-b border-[#2C3E37]/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2C3E37] text-xl">tune</span>
                <h3 className="text-base font-bold text-[#2C3E37] tracking-tight">Filters & Categories</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAllCategories(false)}
                className="text-[#6B7A75] hover:text-[#2C3E37] hover:bg-[#2C3E37]/5 transition-all duration-200 p-1 rounded-full cursor-pointer flex items-center justify-center w-7 h-7"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Price Limit Filter inside the Modal */}
            <div className="flex flex-col gap-2 border-b border-[#2C3E37]/10 pb-5 mb-5 select-none">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2C3E37] mb-1">
                <span className="material-symbols-outlined text-base">payments</span>
                <span>Price Limit</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-[#6B7A75]">
                <span>Max budget</span>
                <span className="text-[#0D5C2F] text-sm font-bold">₹{maxPriceFilter}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                className="w-full h-1 bg-[#2C3E37]/10 rounded-lg appearance-none cursor-pointer accent-[#0D5C2F]"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-[#2C3E37]">Select Category</span>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto py-1 pr-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id.toString()}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id.toString());
                      setShowAllCategories(false);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                      selectedCategory === cat.id.toString()
                        ? "bg-[#2C3E37] text-white shadow-md shadow-[#2C3E37]/15"
                        : "bg-white text-[#6B7A75] border border-[#2C3E37]/10 hover:border-[#2C3E37]/35 hover:text-[#2C3E37]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
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
