"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import axios from "axios";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        if (res.data && res.data.success) {
          setCategories(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6F0]/30 text-[#242926] flex flex-col font-['Inter',sans-serif]">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 w-full">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          {/* <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7A75] hover:text-[#2C3E37] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </Link> */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-[#242926] mt-2">
            Shop by Category
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7A75] mt-1.5 max-w-lg">
            Discover remedies and products sorted by organic origin, designed to support your natural wellness.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-[#E8EDEA] p-6 animate-pulse flex flex-col justify-between">
                <div className="h-4 bg-[#E8EDEA] rounded w-1/2"></div>
                <div className="h-4 bg-[#E8EDEA] rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          /* Empty Categories State */
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8EDEA] p-8 shadow-xs flex flex-col items-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#F5F8F6] text-[#6B7A75] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">category</span>
            </div>
            <h3 className="text-base font-semibold text-[#242926]">No categories found</h3>
            <p className="text-xs text-[#6B7A75] mt-1.5 text-center">
              Our botanical catalogs are currently updating. Please check back later.
            </p>
          </div>
        ) : (
          /* Categories Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const catId = cat.id.toString();

              return (
                <Link
                  key={catId}
                  href={`/products?category_id=${catId}`}
                  className="group bg-white border border-[#E8EDEA] rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all duration-300 flex flex-col justify-between hover:border-[#2C3E37]/30 min-h-[160px] relative overflow-hidden"
                >
                  {/* Decorative background leaf symbol */}
                  <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-7xl text-[#F0F3F1]/50 group-hover:text-[#2C3E37]/5 transition-all duration-500 transform group-hover:rotate-12 group-hover:scale-110">
                    eco
                  </span>

                  <div>
                    <span className="material-symbols-outlined text-[#2C3E37] text-2xl bg-[#F5F8F6] p-2 rounded-xl inline-block mb-4">
                      spa
                    </span>
                    <h3 className="text-lg font-medium text-[#242926] group-hover:text-[#2C3E37] transition-colors">
                      {cat.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-[#6B7A75] group-hover:text-[#2C3E37] mt-4 transition-colors">
                    Explore products
                    <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
                      chevron_right
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
