"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import axios from "axios";

export default function ProductDetailsPage({ params }) {
  const unwrappedParams = React.use(params);
  const productId = unwrappedParams.id;

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(true);

  // Cart quantity selector state
  const [qty, setQty] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Related products cart states
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoadingProduct(true);
      setLoadingRelated(true);
      try {
        const res = await axios.get(`/api/products/${productId}`);
        if (res.data && res.data.success) {
          const mainProduct = res.data.data;
          setProduct(mainProduct);
          
          // Reset qty to 1 when product changes
          setQty(1);

          // Fetch related products in same category
          if (mainProduct.category_id) {
            const relRes = await axios.get(`/api/products`, {
              params: { category_id: mainProduct.category_id.toString() }
            });
            if (relRes.data && relRes.data.success) {
              const filtered = (relRes.data.data || [])
                .filter((p) => p.id.toString() !== mainProduct.id.toString())
                .slice(0, 4);
              setRelatedProducts(filtered);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        setLoadingProduct(false);
        setLoadingRelated(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || addingToCart) return;
    setAddingToCart(true);
    addToCart(product, qty);
    setQty(1); // Reset quantity selector back to 1

    setTimeout(() => {
      setAddingToCart(false);
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    }, 600);
  };

  const handleAddToCartRelated = (item) => {
    const itemId = item.id.toString();
    if (addingId === itemId) return; // Prevent double trigger
    setAddingId(itemId);
    addToCart(item, 1);

    setTimeout(() => {
      setAddingId(null);
      setAddedIds((prev) => ({ ...prev, [itemId]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [itemId]: false }));
      }, 2000);
    }, 600);
  };

  if (loadingProduct) {
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

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF6F0]/30 flex flex-col font-['Inter',sans-serif]">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-[#6B7A75] mb-4">sentiment_dissatisfied</span>
          <h2 className="text-xl font-medium text-[#242926]">Product not found</h2>
          <p className="text-sm text-[#6B7A75] mt-1 mb-6">The product you are looking for does not exist or has been removed.</p>
          <Link href="/products" className="px-6 py-2.5 bg-[#2C3E37] text-white text-xs font-semibold rounded-full hover:bg-[#1E2D27] transition-all shadow-sm">
            Back to Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isFav = isInWishlist(product.id.toString());
  const price = parseFloat(product.price) || 0.0;
  const inStock = product.quantity > 0;
  const mainImage = product.thumbnail_url || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600";

  return (
    <div className="min-h-screen bg-[#FAF6F0]/30 text-[#242926] flex flex-col font-['Inter',sans-serif]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7A75] hover:text-[#2C3E37] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Products
          </Link>
        </div>

        {/* Product Details Layout */}
        <div className="bg-white border border-[#E8EDEA] rounded-2xl shadow-xs p-5 sm:p-8 lg:p-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Media Layout */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F5F8F6] border border-[#F0F3F1]">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="h-full w-full object-cover transition-all duration-300"
                />
                
                {/* Category tag inside image */}
                {product.category && (
                  <span className="absolute top-4 left-4 text-[10px] font-medium tracking-wide uppercase bg-white/95 text-[#2C3E37] px-3 py-1 rounded-md shadow-sm">
                    {product.category.name}
                  </span>
                )}
              </div>

              {/* Extra Images Gallery */}
              {product.images && product.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  <div className="aspect-square bg-[#F5F8F6] border border-[#2C3E37]/35 rounded-lg overflow-hidden cursor-pointer">
                    <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  {product.images.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-[#F5F8F6] border border-[#F0F3F1] hover:border-[#2C3E37]/30 rounded-lg overflow-hidden cursor-pointer transition-all">
                      <img src={img.image_url} alt={`${product.name}-${idx}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info Area */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#6B7A75] uppercase tracking-wider block mb-1">
                  {product.category?.name || "Botanicals"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-light text-[#242926] leading-tight">
                  {product.name}
                </h1>
                
                {/* Price block */}
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-light text-[#242926]">
                    ₹{price.toFixed(2)}
                  </span>
                  {product.gst && parseFloat(product.gst) > 0 && (
                    <span className="text-[10px] font-semibold text-[#6B7A75] bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#E8EDEA]">
                      GST {parseFloat(product.gst)}% included
                    </span>
                  )}
                </div>

                {/* Stock and SKU info */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs">
                  {/* <div className="flex items-center gap-1">
                    <span className="text-[#6B7A75]">SKU:</span>
                    <span className="font-mono text-[#242926] font-semibold">{product.sku}</span>
                  </div> */}
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${inStock ? "bg-emerald-500" : "bg-rose-500"}`}></div>
                    <span className={inStock ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                      {inStock ? `In Stock` : "Out of Stock"}
                    </span>
                  </div>
                </div>

                {/* Short description */}
                {product.short_description && (
                  <p className="text-sm text-[#6B7A75] mt-6 font-light leading-relaxed border-t border-[#F0F3F1] pt-6">
                    {product.short_description}
                  </p>
                )}
              </div>

              {/* Purchase Controls & Wishlist Action */}
              <div className="mt-8 border-t border-[#F0F3F1] pt-6 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Quantity selector */}
                  {/* {inStock && (
                    <div className="flex items-center border border-[#E8EDEA] rounded-xl bg-[#FAF6F0]/20 h-11">
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="w-10 h-full flex items-center justify-center text-[#6B7A75] hover:text-[#2C3E37] transition-colors cursor-pointer"
                        disabled={qty <= 1}
                      >
                        <span className="material-symbols-outlined text-base">remove</span>
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#242926]">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
                        className="w-10 h-full flex items-center justify-center text-[#6B7A75] hover:text-[#2C3E37] transition-colors cursor-pointer"
                        disabled={qty >= product.quantity}
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                      </button>
                    </div>
                  )} */}

                  {/* Add to Cart button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!inStock || addingToCart}
                    className={`flex-1 min-w-[160px] h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                      addedToCart
                        ? "bg-[#F0F3F1] text-[#2C3E37] border border-[#E8EDEA]"
                        : "bg-[#2C3E37] text-white hover:bg-[#1E2D27] hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    }`}
                  >
                    {addingToCart ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : addedToCart ? (
                      <>
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">shopping_bag</span>
                        {inStock ? "Add to Cart" : "Out of Stock"}
                      </>
                    )}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isFav
                        ? "bg-[#FAF6F0] border-red-200 text-red-500 shadow-xs"
                        : "border-[#E8EDEA] bg-white text-[#6B7A75] hover:border-red-300 hover:text-red-500"
                    }`}
                    aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <svg
                      className="w-5 h-5"
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
                </div>
              </div>
            </div>
          </div>

          {/* Full description details */}
          {product.description && (
            <div className="mt-12 border-t border-[#F0F3F1] pt-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#242926] mb-4">
                Product Details
              </h2>
              <div className="text-sm text-[#6B7A75] leading-relaxed font-light space-y-4 max-w-4xl whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}
        </div>

        {/* Related Products Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-light text-[#242926] mb-6">
            You May Also Like
          </h2>

          {loadingRelated ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-[#E8EDEA] overflow-hidden animate-pulse">
                  <div className="h-48 sm:h-56 bg-[#F5F8F6]"></div>
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="h-4 bg-[#E8EDEA] rounded w-3/4"></div>
                    <div className="h-4 bg-[#E8EDEA] rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : relatedProducts.length === 0 ? (
            <p className="text-xs text-[#6B7A75]">No related products found in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((item) => {
                const isItemFav = isInWishlist(item.id.toString());
                const itemPrice = parseFloat(item.price) || 0.0;
                const itemImage = item.thumbnail_url || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600";
                const itemId = item.id.toString();

                return (
                  <div
                    key={itemId}
                    className="group bg-white rounded-xl border border-[#E8EDEA] overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    {/* Product Thumbnail */}
                    <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-[#F5F8F6]">
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Category Badge */}
                      {item.category && (
                        <span className="absolute top-3 left-3 text-[9px] sm:text-[10px] font-medium tracking-wide uppercase bg-white/95 text-[#2C3E37] px-2.5 py-1 rounded-md shadow-sm">
                          {item.category.name}
                        </span>
                      )}

                      {/* Wishlist Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(item.id)}
                        className={`absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer ${
                          isItemFav
                            ? "text-red-500 opacity-100"
                            : "text-[#6B7A75] hover:text-red-500 opacity-0 group-hover:opacity-100"
                        }`}
                        aria-label={isItemFav ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill={isItemFav ? "currentColor" : "none"}
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
                          href={`/product/${itemId}`}
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
                          {item.name}
                        </h3>
                        <span className="text-base sm:text-lg font-light text-[#242926] whitespace-nowrap flex-shrink-0">
                          ₹{itemPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[#F0F3F1]">
                        <Link
                          href={`/product/${itemId}`}
                          className="flex-1 py-2 px-3 bg-[#F5F8F6] text-[#242926] text-xs font-medium rounded-lg text-center hover:bg-[#E8EDEA] transition-colors"
                        >
                          View Product
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleAddToCartRelated(item)}
                          disabled={addingId === itemId}
                          className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 min-w-[80px] cursor-pointer relative z-10 ${
                            addedIds[itemId]
                              ? "bg-[#F0F3F1] text-[#2C3E37]"
                              : "bg-[#2C3E37] text-white hover:bg-[#1E2D27] hover:shadow-sm disabled:opacity-60"
                          }`}
                        >
                          {addingId === itemId ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : addedIds[itemId] ? (
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
