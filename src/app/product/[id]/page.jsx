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
  const [descOpen, setDescOpen] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

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
  const mainImage = product.thumbnail_url || (product.images && product.images[0]?.image_url) || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600";

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#1C1C1A] flex flex-col font-['Inter',sans-serif] antialiased">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#7E7E7A] hover:text-[#1C1C1A] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Products
          </Link>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-16">
          {/* Left Column: Image Area */}
          <div className="lg:col-span-5 w-full">
            <div 
              onClick={() => setShowImageModal(true)}
              className="relative aspect-[4/5] max-w-sm mx-auto overflow-hidden rounded-3xl bg-[#F4F4F2] shadow-2xs group cursor-zoom-in"
            >
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-103"
              />
              {product.category && (
                <span className="absolute top-6 left-6 text-[10px] font-semibold tracking-wider uppercase bg-white/90 backdrop-blur-xs text-[#1C1C1A] px-3.5 py-1.5 rounded-full shadow-2xs">
                  {product.category.name}
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Content Area */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8 lg:min-h-[480px]">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-[#7E7E7A] uppercase tracking-widest bg-[#EFEFEF] px-2.5 py-1 rounded-sm">
                  {product.category?.name || "Botanicals"}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  <span className={`text-[10px] font-semibold tracking-wider uppercase ${inStock ? "text-emerald-700" : "text-rose-700"}`}>
                    {inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#1C1C1A] leading-tight tracking-tight font-serif">
                  {product.name}
                </h1>
                <p className="text-2xl font-light text-[#4A4A48] pt-1">
                  ₹{price.toFixed(2)}
                </p>
              </div>

              {product.short_description && (
                <div className="text-sm text-[#5C5C5A] font-light leading-relaxed border-t border-[#EDEDEB] pt-6 whitespace-pre-line">
                  {product.short_description}
                </div>
              )}
            </div>

            {/* Purchase Controls & Action Area */}
            <div className="border-t border-[#EDEDEB] pt-8 space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                {inStock && (
                  <div className="flex items-center border border-[#E1E1DE] rounded-xl bg-white h-12 shadow-3xs">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-12 h-full flex items-center justify-center text-[#7E7E7A] hover:text-[#1C1C1A] transition-colors cursor-pointer"
                      disabled={qty <= 1}
                    >
                      <span className="material-symbols-outlined text-sm font-semibold">remove</span>
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-[#1C1C1A]">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
                      className="w-12 h-full flex items-center justify-center text-[#7E7E7A] hover:text-[#1C1C1A] transition-colors cursor-pointer"
                      disabled={qty >= product.quantity}
                    >
                      <span className="material-symbols-outlined text-sm font-semibold">add</span>
                    </button>
                  </div>
                )}

                {/* Add to Cart button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock || addingToCart}
                  className={`flex-1 min-w-[200px] h-12 rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                    addedToCart
                      ? "bg-[#EFEFEF] text-[#4A4A48] border border-[#E1E1DE]"
                      : "bg-[#1C1C1A] text-white hover:bg-[#333330] hover:shadow-xs active:scale-98"
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
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    isFav
                      ? "bg-red-50 border-red-100 text-red-500 shadow-2xs"
                      : "border-[#E1E1DE] bg-white text-[#7E7E7A] hover:border-red-200 hover:text-red-500"
                  }`}
                  aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <svg
                    className="w-5 h-5"
                    fill={isFav ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Accordion dropdown for description */}
            {product.description && (
              <div className="border-t border-[#EDEDEB] pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setDescOpen(!descOpen)}
                  className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-[#1C1C1A] hover:text-[#4A4A48] transition-colors py-2 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">menu_book</span>
                    Product Details & Usage
                  </span>
                  <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: descOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                    expand_more
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: descOpen ? "500px" : "0px", opacity: descOpen ? 1 : 0 }}
                >
                  <div className="text-xs text-[#5C5C5A] leading-relaxed font-light whitespace-pre-line pt-3 pb-2">
                    {product.description}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        <div className="border-t border-[#EDEDEB] pt-16">
          <h2 className="text-xl sm:text-2xl font-light text-[#1C1C1A] mb-8 tracking-tight font-serif">
            You May Also Like
          </h2>

          {loadingRelated ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#EDEDEB] overflow-hidden animate-pulse">
                  <div className="h-64 bg-[#F4F4F2]"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-[#EDEDEB] rounded w-3/4"></div>
                    <div className="h-4 bg-[#EDEDEB] rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : relatedProducts.length === 0 ? (
            <p className="text-xs text-[#7E7E7A]">No related products found in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => {
                const isItemFav = isInWishlist(item.id.toString());
                const itemPrice = parseFloat(item.price) || 0.0;
                const itemImage = item.thumbnail_url || (item.images && item.images[0]?.image_url) || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600";
                const itemId = item.id.toString();

                return (
                  <div
                    key={itemId}
                    className="group bg-white rounded-2xl border border-[#EDEDEB] overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
                  >
                    {/* Product Thumbnail */}
                    <div className="relative h-64 w-full overflow-hidden bg-[#F4F4F2]">
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                        loading="lazy"
                      />

                      {/* Wishlist Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(item.id)}
                        className={`absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 shadow-2xs flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer ${
                          isItemFav
                            ? "text-red-500 opacity-100"
                            : "text-[#7E7E7A] hover:text-red-500 opacity-0 group-hover:opacity-100"
                        }`}
                        aria-label={isItemFav ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <svg
                          className="w-4 h-4"
                          fill={isItemFav ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="1.2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>

                      {/* Quick action overlay on hover */}
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Link
                          href={`/product/${itemId}`}
                          className="w-full py-2.5 bg-white/95 text-[#1C1C1A] text-xs font-semibold rounded-lg text-center hover:bg-white transition-colors block"
                        >
                          Quick View
                        </Link>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-sm font-medium text-[#1C1C1A] line-clamp-2 flex-1 group-hover:text-[#333330] transition-colors">
                          {item.name}
                        </h3>
                        <span className="text-sm font-light text-[#1C1C1A] whitespace-nowrap flex-shrink-0">
                          ₹{itemPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[#F0F3F1]">
                        <Link
                          href={`/product/${itemId}`}
                          className="flex-1 py-2 px-3 bg-[#F4F4F2] text-[#1C1C1A] text-xs font-medium rounded-lg text-center hover:bg-[#EFEFEF] transition-colors"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleAddToCartRelated(item)}
                          disabled={addingId === itemId}
                          className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 min-w-[80px] cursor-pointer relative z-10 ${
                            addedIds[itemId]
                              ? "bg-[#EFEFEF] text-[#1C1C1A]"
                              : "bg-[#1C1C1A] text-white hover:bg-[#333330]"
                          }`}
                        >
                          {addingId === itemId ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : addedIds[itemId] ? (
                            "Added"
                          ) : (
                            "Add"
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

      {/* Image Modal Popup */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xs p-4 sm:p-6 transition-all duration-300"
          onClick={() => setShowImageModal(false)}
        >
          <button
            type="button"
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors duration-200 cursor-pointer"
            onClick={() => setShowImageModal(false)}
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
          
          <div 
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={mainImage}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
