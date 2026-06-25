"use client";

import React, { useState } from "react";

export default function HeroSection() {
  // Lifestyle image parallax transform state
  const [transformStyle, setTransformStyle] = useState({
    transform: "scale(1.05) translate(0px, 0px)",
    transition: "transform 0.5s ease-out",
  });

  // Handle mouse move parallax effect on background image
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const moveX = (clientX / innerWidth - 0.5) * 15;
    const moveY = (clientY / innerHeight - 0.5) * 15;
    setTransformStyle({
      transform: `scale(1.05) translate(${moveX}px, ${moveY}px)`,
      transition: "transform 0.1s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle({
      transform: "scale(1.05) translate(0px, 0px)",
      transition: "transform 0.5s ease-out",
    });
  };

  return (
    <section
      className="relative w-full h-[85vh] lg:h-[90vh] overflow-hidden flex items-center bg-background"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBDQ-v9RFAAryVA1cWD5U0FieTZCX0YYJZRgMjegDYFFp1gz_SdIfuCshyrDSqFNzR0X0LgrvUnRj094KgXUiCdHdoCZ6pIESVzed3qYM7nw9AZfbtyqus4n1XkNJOb2jYnJ-L63uxH8VYLdrurYIB9HWvEECmC9vrzUhXNuR9M6JneoXaa5KmZ3WBYlu-6nwrINZtZPI_HZciSdfMK3JImTKFiDJVZveH6ANvEaa_moVAbTDQ-0c-gYyAqSfBnnxjQsxuWVwa0Mg')",
            ...transformStyle,
          }}
        />
      </div>

      {/* Dim/Blur Overlay for text readability */}
      <div className="absolute inset-0 bg-[#242926]/40 backdrop-blur-[1px] z-10"></div>

      {/* Hero Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 w-full text-white flex flex-col justify-between h-full pt-32 pb-16">
        <div className="max-w-2xl mt-12">
          <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-white/15">
            <span className="material-symbols-outlined text-sm text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            Conscious Curations
          </span>
          <h1 className="text-display-lg text-4xl sm:text-5xl lg:text-6.5xl font-headline font-bold leading-[1.1] mb-6 drop-shadow-sm">
            Experience Nature's Finest Selection.
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-[#f0ede4] opacity-90 leading-relaxed font-light mb-8 max-w-xl">
            Sourced with integrity, crafted with mindfulness. Discover organic herbal teas, cold-pressed oils, and skin botanicals designed for your sanctuary.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-bold rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer">
              Explore Collection
            </button>
            <button className="px-8 py-4 bg-transparent border border-white/60 hover:bg-white/10 font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer">
              Our Sourcing Story
            </button>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-white/10 mt-12 bg-black/15 backdrop-blur-md rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-primary-fixed-dim">
              <span className="material-symbols-outlined text-xl">spa</span>
            </div>
            <div>
              <p className="text-sm font-bold">100% Organic Ingredients</p>
              <p className="text-xs text-[#c8c5bc]/80 font-light">Certified pure botanical extracts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-primary-fixed-dim">
              <span className="material-symbols-outlined text-xl">handshake</span>
            </div>
            <div>
              <p className="text-sm font-bold">Consciously Sourced</p>
              <p className="text-xs text-[#c8c5bc]/80 font-light">Direct and ethical trade partnerships</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-primary-fixed-dim">
              <span className="material-symbols-outlined text-xl">precision_manufacturing</span>
            </div>
            <div>
              <p className="text-sm font-bold">Small Batch Crafting</p>
              <p className="text-xs text-[#c8c5bc]/80 font-light">Ensuring unmatched potency & quality</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
