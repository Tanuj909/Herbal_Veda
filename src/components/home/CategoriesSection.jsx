
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories?structure=flat");
        if (response.data && response.data.success && response.data.data.length > 0) {
          const formatted = response.data.data.slice(0, 4).map((apiCat) => {
            return {
              id: apiCat.id,
              name: apiCat.name,
              slug: apiCat.slug,
              description: apiCat.description,
              imageUrl: apiCat.image_url || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600",
            };
          });
          setCategories(formatted);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to load categories from API:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-[#FAF6F0]/30 font-['Inter',sans-serif]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4 sm:gap-6">
            <div className="max-w-xl">
              <div className="h-7 sm:h-8 bg-[#F5F8F6] rounded w-40 sm:w-52 animate-pulse"></div>
            </div>
            <div className="h-4 bg-[#F5F8F6] rounded w-28 sm:w-36 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[160px] sm:h-[180px] lg:h-[200px] bg-[#F5F8F6] rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white font-['Inter',sans-serif] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-[#242926]">
              Shop by Categories
            </h2>
            <p className="text-[10px] sm:text-xs text-[#6B7A75] mt-0.5 sm:mt-1">
              Explore our curated collection
            </p>
          </div>
          <Link
            href="/categories"
            className="group inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-[#2C3E37] hover:text-[#1E2D27] transition-colors duration-300 self-start md:self-auto"
          >
            Explore All Categories
            <svg
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:translate-x-1"
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

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-10 sm:py-12">
            <p className="text-xs sm:text-sm text-[#6B7A75]">No categories available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {categories.map((cat, index) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group flex flex-col justify-between p-4 rounded-xl bg-white border border-[#E8EDEA] hover:border-[#8BA89A] cursor-pointer shadow-xs hover:shadow-md transition-all duration-300 min-h-[120px] sm:min-h-[140px]"
              >
                <div>
                  {/* Top Row: Eco icon */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-xl text-[#8BA89A] group-hover:text-[#2C3E37] transition-colors duration-300">
                      spa
                    </span>
                  </div>

                  {/* Category Name */}
                  <h3 className="text-sm sm:text-base font-medium text-[#242926] group-hover:text-[#2C3E37] transition-colors duration-300 mb-1">
                    {cat.name}
                  </h3>
                  
                  {/* Description (if available) */}
                  {cat.description && (
                    <p className="text-[11px] sm:text-xs text-[#6B7A75] line-clamp-1 leading-relaxed mb-2">
                      {cat.description}
                    </p>
                  )}
                </div>

                {/* Shop Now Button - Cleaner */}
                <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#2C3E37] group-hover:text-[#8BA89A] transition-colors duration-300 mt-auto">
                  <span>Explore</span>
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
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
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Mobile view all button */}
        <div className="mt-6 sm:mt-8 text-center md:hidden">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-[#2C3E37] hover:text-[#1E2D27] transition-colors"
          >
            Explore All Categories
            <svg
              className="w-3 h-3 sm:w-3.5 sm:h-3.5"
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
      </div>
    </section>
  );
}