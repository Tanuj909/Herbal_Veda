"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative h-screen h-[100dvh] flex items-center overflow-hidden">
      {/* Background Image and Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover object-[center_35%]"
          alt="A serene, high-end lifestyle photograph of organic skincare bottles resting on smooth river stones."
          src="/banners/banner.png"
        />
        <div className="absolute inset-0 bg-black/15 md:bg-black/10"></div>
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(250, 246, 240, 0) 0%, rgba(250, 246, 240, 0.85) 85%, rgba(250, 246, 240, 1) 100%)",
          }}
        ></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full pt-16 md:pt-0">
        <div
          className={`max-w-2xl text-left transition-all duration-1000 ease-out transform ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-on-surface leading-tight tracking-tight mb-6">
            Elevated for{" "}
            <span className="bg-gradient-to-r from-[#0D5C2F] to-[#4A8F3B] bg-clip-text text-transparent italic font-semibold">
              Intimacy
            </span>
            , Crafted with Care.
          </h1>
          <p className="hidden md:block text-xl text-on-surface-variant font-body mb-10 leading-relaxed">
            Experience intimacy with thoughtfully crafted products designed for comfort, confidence, and pleasure.
          </p>
          <div className="flex flex-row flex-wrap gap-3.5">
            <Link
              href="/products"
              className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#0D5C2F] to-[#4A8F3B] text-white rounded-2xl font-bold text-sm sm:text-base shadow-soft-shadow hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center"
            >
              Shop Now
            </Link>
            <Link
              href="/categories"
              className="px-6 sm:px-8 py-3 bg-white/90 backdrop-blur-xs text-[#2C3E37] border border-[#2C3E37]/15 rounded-2xl font-bold text-sm sm:text-base shadow-soft-shadow hover:bg-white hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center"
            >
              Explore Categories
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}