"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center bg-[#242926]">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2C3E37] via-[#242926] to-[#1A1F1C]"></div>
        
        {/* Decorative subtle patterns */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#2C3E37]/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-r from-[#2C3E37]/10 to-transparent"></div>
        
        {/* Subtle glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#2C3E37]/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#2C3E37]/10 blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 w-full text-center py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col items-center">
          {/* Main Heading */}
          <h1
            className={`text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-light leading-[1.15] text-white mb-4 sm:mb-6 transition-all duration-700 delay-100 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Experience{" "}
            <span className="text-[#8BA89A] font-medium">
              Nature's Finest
            </span>
          </h1>

          {/* Description */}
          <p
            className={`text-sm sm:text-base lg:text-lg text-white/60 leading-relaxed mb-8 sm:mb-12 max-w-2xl mx-auto font-light tracking-wide transition-all duration-700 delay-200 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Sourced with integrity, crafted with mindfulness. Discover organic
            herbal teas, cold-pressed oils, and skin botanicals designed for
            your sanctuary.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center gap-3 sm:gap-4 transition-all duration-700 delay-300 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Link
              href="/shop"
              className="group relative px-8 sm:px-12 py-3.5 sm:py-4 bg-[#8BA89A] text-[#242926] hover:bg-[#7A9A8A] font-medium text-sm sm:text-base rounded-lg transition-all duration-300 shadow-lg hover:shadow-[#8BA89A]/20 hover:scale-105 active:scale-95 flex items-center gap-2 overflow-hidden"
            >
              <span className="relative z-10">Explore Products</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1"
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
              <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            </Link>
            
            <Link
              href="/about"
              className="px-8 sm:px-12 py-3.5 sm:py-4 border border-white/20 text-white hover:bg-white/10 font-medium text-sm sm:text-base rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div
            className={`grid grid-cols-3 gap-6 sm:gap-12 mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/5 transition-all duration-700 delay-400 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-light text-white">50+</p>
              <p className="text-[10px] sm:text-xs text-white/40 tracking-wider uppercase mt-1">Organic Products</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-light text-white">100%</p>
              <p className="text-[10px] sm:text-xs text-white/40 tracking-wider uppercase mt-1">Natural Ingredients</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-light text-white">4.9★</p>
              <p className="text-[10px] sm:text-xs text-white/40 tracking-wider uppercase mt-1">Customer Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#8BA89A]/30 to-transparent"></div>
    </section>
  );
}