// "use client";

// import React, { useState } from "react";

// export default function HeroSection() {
//   // Lifestyle image parallax transform state
//   const [transformStyle, setTransformStyle] = useState({
//     transform: "scale(1.05) translate(0px, 0px)",
//     transition: "transform 0.5s ease-out",
//   });

//   // Handle mouse move parallax effect on background image
//   const handleMouseMove = (e) => {
//     const { clientX, clientY } = e;
//     const { innerWidth, innerHeight } = window;
//     const moveX = (clientX / innerWidth - 0.5) * 15;
//     const moveY = (clientY / innerHeight - 0.5) * 15;
//     setTransformStyle({
//       transform: `scale(1.05) translate(${moveX}px, ${moveY}px)`,
//       transition: "transform 0.1s ease-out",
//     });
//   };

//   const handleMouseLeave = () => {
//     setTransformStyle({
//       transform: "scale(1.05) translate(0px, 0px)",
//       transition: "transform 0.5s ease-out",
//     });
//   };

//   return (
//     <section
//       className="relative w-full h-[85vh] lg:h-[90vh] overflow-hidden flex items-center bg-background"
//       onMouseMove={handleMouseMove}
//       onMouseLeave={handleMouseLeave}
//     >
//       {/* Background Image Container */}
//       <div className="absolute inset-0 z-0">
//         <div
//           className="w-full h-full bg-cover bg-center"
//           style={{
//             backgroundImage:
//               "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBDQ-v9RFAAryVA1cWD5U0FieTZCX0YYJZRgMjegDYFFp1gz_SdIfuCshyrDSqFNzR0X0LgrvUnRj094KgXUiCdHdoCZ6pIESVzed3qYM7nw9AZfbtyqus4n1XkNJOb2jYnJ-L63uxH8VYLdrurYIB9HWvEECmC9vrzUhXNuR9M6JneoXaa5KmZ3WBYlu-6nwrINZtZPI_HZciSdfMK3JImTKFiDJVZveH6ANvEaa_moVAbTDQ-0c-gYyAqSfBnnxjQsxuWVwa0Mg')",
//             ...transformStyle,
//           }}
//         />
//       </div>

//       {/* Dim/Blur Overlay for text readability */}
//       <div className="absolute inset-0 bg-[#242926]/40 backdrop-blur-[1px] z-10"></div>

//       {/* Hero Content */}
//       <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 w-full text-white flex flex-col justify-between h-full pt-32 pb-16">
//         <div className="max-w-2xl mt-12">
//           <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-white/15">
//             <span className="material-symbols-outlined text-sm text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
//             Conscious Curations
//           </span>
//           <h1 className="text-display-lg text-4xl sm:text-5xl lg:text-6.5xl font-headline font-bold leading-[1.1] mb-6 drop-shadow-sm">
//             Experience Nature's Finest Selection.
//           </h1>
//           <p className="text-base sm:text-lg lg:text-xl text-[#f0ede4] opacity-90 leading-relaxed font-light mb-8 max-w-xl">
//             Sourced with integrity, crafted with mindfulness. Discover organic herbal teas, cold-pressed oils, and skin botanicals designed for your sanctuary.
//           </p>
//           <div className="flex flex-wrap gap-4">
//             <button className="px-8 py-4 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-bold rounded-xl transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer">
//               Explore Collection
//             </button>
//             <button className="px-8 py-4 bg-transparent border border-white/60 hover:bg-white/10 font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer">
//               Our Sourcing Story
//             </button>
//           </div>
//         </div>

//         {/* Bottom Trust Indicators */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-white/10 mt-12 bg-black/15 backdrop-blur-md rounded-2xl p-6 border border-white/5">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-primary-fixed-dim">
//               <span className="material-symbols-outlined text-xl">spa</span>
//             </div>
//             <div>
//               <p className="text-sm font-bold">100% Organic Ingredients</p>
//               <p className="text-xs text-[#c8c5bc]/80 font-light">Certified pure botanical extracts</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-primary-fixed-dim">
//               <span className="material-symbols-outlined text-xl">handshake</span>
//             </div>
//             <div>
//               <p className="text-sm font-bold">Consciously Sourced</p>
//               <p className="text-xs text-[#c8c5bc]/80 font-light">Direct and ethical trade partnerships</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-primary-fixed-dim">
//               <span className="material-symbols-outlined text-xl">precision_manufacturing</span>
//             </div>
//             <div>
//               <p className="text-sm font-bold">Small Batch Crafting</p>
//               <p className="text-xs text-[#c8c5bc]/80 font-light">Ensuring unmatched potency & quality</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[#242926]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat scale-105"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBDQ-v9RFAAryVA1cWD5U0FieTZCX0YYJZRgMjegDYFFp1gz_SdIfuCshyrDSqFNzR0X0LgrvUnRj094KgXUiCdHdoCZ6pIESVzed3qYM7nw9AZfbtyqus4n1XkNJOb2jYnJ-L63uxH8VYLdrurYIB9HWvEECmC9vrzUhXNuR9M6JneoXaa5KmZ3WBYlu-6nwrINZtZPI_HZciSdfMK3JImTKFiDJVZveH6ANvEaa_moVAbTDQ-0c-gYyAqSfBnnxjQsxuWVwa0Mg')",
          }}
        />
        {/* Enhanced gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#242926]/80 via-[#242926]/60 to-[#242926]/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#242926]/90 via-[#242926]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#242926]/30 to-transparent"></div>
      </div>

      {/* Decorative floating elements */}
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse z-0"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl animate-pulse delay-1000 z-0"></div>
      
      {/* Animated lines */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="absolute top-1/4 left-10 w-[1px] h-20 bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
        <div className="absolute top-1/3 right-20 w-[1px] h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
        <div className="absolute bottom-1/4 left-1/3 w-[1px] h-24 bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 w-full text-center">
        <div className="flex flex-col items-center">
          {/* Main Heading - Single Line */}
          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.2] text-white mb-6 transition-all duration-700 delay-100 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Experience{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary">
              Nature's Finest
            </span>
          </h1>

          {/* Description */}
          <p
            className={`text-base sm:text-lg lg:text-xl text-white/60 leading-relaxed mb-12 max-w-2xl mx-auto font-light tracking-wide transition-all duration-700 delay-200 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Sourced with integrity, crafted with mindfulness. Discover organic
            herbal teas, cold-pressed oils, and skin botanicals designed for
            your sanctuary.
          </p>

          {/* CTA Button with hover effects */}
          <div
            className={`transition-all duration-700 delay-300 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <button className="group relative px-12 py-5 bg-primary text-[#242926] hover:bg-primary/90 font-semibold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-primary/25 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-3 overflow-hidden">
              <span className="relative z-10">Explore Products</span>
              <svg
                className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1"
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
            </button>
          </div>

          {/* Minimal stats */}
          <div
            className={`grid grid-cols-3 gap-12 mt-16 pt-8 border-t border-white/5 transition-all duration-700 delay-400 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-white">50+</p>
              <p className="text-xs text-white/40 tracking-wider uppercase mt-1">Organic Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-white/40 tracking-wider uppercase mt-1">Natural Ingredients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">4.9★</p>
              <p className="text-xs text-white/40 tracking-wider uppercase mt-1">Customer Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
    </section>
  );
}