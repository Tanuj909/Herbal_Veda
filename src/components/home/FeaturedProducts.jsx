"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

// Curated high-end fallback products
const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    name: "Restorative Sage Oil",
    categoryName: "Essential Oils",
    price: 28.00,
    rating: 4.9,
    reviewsCount: 84,
    thumbnailUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600",
    description: "Pure botanical aromatherapy extract to restore calm and focus.",
  },
  {
    id: "prod-2",
    name: "Golden Chamomile Tea",
    categoryName: "Herbal Teas",
    price: 18.00,
    rating: 4.8,
    reviewsCount: 124,
    thumbnailUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=600",
    description: "Handpicked whole flower organic chamomile infusion for tranquility.",
  },
  {
    id: "prod-3",
    name: "Hydrating Botanical Serum",
    categoryName: "Organic Skincare",
    price: 42.00,
    rating: 5.0,
    reviewsCount: 62,
    thumbnailUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600",
    description: "Restorative cold-pressed seed oils offering lightweight deep hydration.",
  },
  {
    id: "prod-4",
    name: "Clay Cleansing Mask",
    categoryName: "Organic Skincare",
    price: 34.00,
    rating: 4.7,
    reviewsCount: 45,
    thumbnailUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=600",
    description: "Mineral-rich green clay infused with grounding lavender buds.",
  },
];

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products");
        if (response.data && response.data.success && response.data.data.length > 0) {
          // Format API values correctly
          const formatted = response.data.data.slice(0, 4).map((apiProd, index) => {
            const mock = MOCK_PRODUCTS[index % MOCK_PRODUCTS.length];
            return {
              id: apiProd.id,
              name: apiProd.name,
              categoryName: apiProd.category?.name || mock.categoryName,
              price: parseFloat(apiProd.price) || mock.price,
              rating: mock.rating,
              reviewsCount: mock.reviewsCount,
              thumbnailUrl: apiProd.thumbnail_url || mock.thumbnailUrl,
              description: apiProd.short_description || mock.description,
            };
          });
          setProducts(formatted);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch (error) {
        console.error("Failed to load products from API:", error);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (productId) => {
    setAddingId(productId);
    setTimeout(() => {
      setAddingId(null);
      setAddedIds((prev) => ({ ...prev, [productId]: true }));
      // Reset "added" state after 2 seconds
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [productId]: false }));
      }, 2000);
    }, 800);
  };

  return (
    <section className="py-24 bg-surface-container-lowest font-body border-t border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface">
            Featured Apothecary
          </h2>
          <p className="text-on-surface-variant mt-2 text-sm sm:text-base font-light">
            Our most sought-after holistic remedies, formulated in small batches with premium certified organic raw materials.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="group bg-background rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
            >
              {/* Product Thumbnail */}
              <div className="relative h-56 w-full overflow-hidden bg-surface-container-low">
                <img
                  src={prod.thumbnailUrl}
                  alt={prod.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-4 left-4 text-[10px] font-bold tracking-wider uppercase bg-surface-container-lowest text-primary px-2.5 py-1 rounded-md border border-outline-variant/30">
                  {prod.categoryName}
                </span>
                
                {/* Wishlist Button on Hover */}
                <button
                  type="button"
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/95 shadow-sm text-on-surface-variant hover:text-error flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
                  aria-label="Add to wishlist"
                >
                  <span className="material-symbols-outlined text-lg">favorite</span>
                </button>
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-light line-clamp-2 leading-relaxed mb-2.5">
                    {prod.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 mt-auto pt-3 border-t border-outline-variant/10">
                  <span className="text-lg font-bold text-on-surface">
                    ${prod.price.toFixed(2)}
                  </span>
                  
                  {/* Quick Add Button */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(prod.id)}
                    disabled={addingId === prod.id}
                    className={`h-10 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                      addedIds[prod.id]
                        ? "bg-primary-container text-on-primary-container border border-primary/20 scale-95"
                        : "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container hover:scale-102 active:scale-95 disabled:opacity-55"
                    }`}
                  >
                    {addingId === prod.id ? (
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : addedIds[prod.id] ? (
                      <>
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                        Added
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">shopping_bag</span>
                        Quick Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
