// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import axios from "axios";

// export default function CategoriesSection() {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await axios.get("/api/categories?structure=flat");
//         if (response.data && response.data.success && response.data.data.length > 0) {
//           const formatted = response.data.data.slice(0, 4).map((apiCat) => {
//             return {
//               id: apiCat.id,
//               name: apiCat.name,
//               slug: apiCat.slug,
//               description: apiCat.description,
//               imageUrl: apiCat.image_url || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600",
//             };
//           });
//           setCategories(formatted);
//         } else {
//           setCategories([]);
//         }
//       } catch (error) {
//         console.error("Failed to load categories from API:", error);
//         setCategories([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   return (
//     <section className="py-24 bg-background font-body relative overflow-hidden">
//       {/* Background decorative element */}
//       <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent"></div>
//       <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-r from-primary/5 to-transparent"></div>
      
//       <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
//         {/* Section Header */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
//           <div className="max-w-xl">
//             <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface">
//               Shop by Categories
//             </h2>
//           </div>
//           <Link
//             href="#"
//             className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-300 self-start md:self-auto"
//           >
//             Explore All Categories
//             <svg
//               className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M17 8l4 4m0 0l-4 4m4-4H3"
//               />
//             </svg>
//           </Link>
//         </div>

//         {/* Categories Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {categories.map((cat, index) => (
//             <Link
//               key={cat.id}
//               href={`/shop?category=${cat.slug}`}
//               className="group relative h-[320px] rounded-2xl overflow-hidden bg-surface-container-low cursor-pointer"
//               style={{
//                 animationDelay: `${index * 100}ms`,
//               }}
//             >
//               {/* Image Container */}
//               <div className="absolute inset-0">
//                 <img
//                   src={cat.imageUrl}
//                   alt={cat.name}
//                   className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
//                   loading="lazy"
//                 />
//               </div>

//               {/* Gradient Overlay */}
//               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-500"></div>
              
//               {/* Top accent line */}
//               <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

//               {/* Content Container */}
//               <div className="absolute inset-0 flex flex-col justify-end p-6">
//                 {/* Category Icon/Number */}
//                 <div className="flex items-center gap-3 mb-3">
//                   <div className="w-8 h-8 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
//                     <span className="text-xs font-bold text-primary">0{index + 1}</span>
//                   </div>
//                   <span className="text-xs text-white/40 uppercase tracking-wider">Category</span>
//                 </div>

//                 {/* Category Name */}
//                 <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300">
//                   {cat.name}
//                 </h3>
                
//                 {/* Description (if available) */}
//                 {cat.description && (
//                   <p className="text-sm text-white/50 line-clamp-2 mb-4">
//                     {cat.description}
//                   </p>
//                 )}

//                 {/* Shop Now Button */}
//                 <div className="flex items-center gap-2 text-sm font-medium text-white/70 group-hover:text-primary transition-colors duration-300">
//                   <span>Shop Now</span>
//                   <svg
//                     className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M17 8l4 4m0 0l-4 4m4-4H3"
//                     />
//                   </svg>
//                 </div>
//               </div>

//               {/* Hover border effect */}
//               <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/30 transition-all duration-500"></div>
//             </Link>
//           ))}
//         </div>

//         {/* Mobile view all button */}
//         <div className="mt-10 text-center md:hidden">
//           <Link
//             href="#"
//             className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
//           >
//             Explore All Categories
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M17 8l4 4m0 0l-4 4m4-4H3"
//               />
//             </svg>
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// }

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
    <section className="py-12 sm:py-16 lg:py-20 bg-[#FAF6F0]/30 font-['Inter',sans-serif] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#2C3E37]/5 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-r from-[#2C3E37]/5 to-transparent"></div>
      
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
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative h-[160px] sm:h-[180px] lg:h-[200px] rounded-xl overflow-hidden bg-white cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Image Container */}
                <div className="absolute inset-0">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                </div>

                {/* Gradient Overlay - More subtle */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500"></div>
                
                {/* Border accent */}
                <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/20 transition-all duration-500"></div>

                {/* Content Container - Simplified */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                  {/* Category Name - Only this is shown */}
                  <h3 className="text-base sm:text-lg lg:text-xl font-medium text-white mb-1 group-hover:text-white transition-colors duration-300">
                    {cat.name}
                  </h3>
                  
                  {/* Description (if available) - Smaller and more subtle */}
                  {cat.description && (
                    <p className="text-[10px] sm:text-xs text-white/60 line-clamp-1 sm:line-clamp-2 mb-2 sm:mb-3">
                      {cat.description}
                    </p>
                  )}

                  {/* Shop Now Button - Cleaner */}
                  <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-white/80 group-hover:text-white transition-colors duration-300">
                    <span>Shop Now</span>
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
                  </div>
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