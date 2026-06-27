
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

const FALLBACK_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCuwkQSDXgTLiyu10lhaEXIJmB6LDXIfnUMlOd63VHTFTw7IVhvhhKe2S4oM_GGBN-RmGvrL50j_HuhQqYJLqlY0w0ciLsQGmT2wRCJ1XI7WPXdUqUdljwgMDbN3S3ARz3XkC57pHj1isSsYtuksUje6TTH0P9r16pYw-FjoQZHkmjQ1W44jbpwlv7ModQlS5dMUipHVICb1xXvI7AaK9u_40yT7i_D4Im-JoHUk-KLO3LxKKentyd3CLx4y8QP2uapdkGlUyUEHw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCcaI4T-u30_FxIh5K_qvHXyQNwi4fSyxEJbD6wBkJ-tTfaxAnjA_gePQdDcZBlSMeLYTaZEXwA607olibzyHvztN5TvjmZ1uCuoJF4dG4pwV3OeZTjwqhsbj0KOZnUg4XgMj9hndZLTCz6XBobkwSYFF1nw2k3_F3pB6BHzC7u5mDSMLcFdzRu1BMz19p2qG6avqufdh1xN0vcPxad0QVDNS3BpaC7BomMxPFAQRnCeXHjJRsW1IfmyC0TAaUKVQBiUvESsT74UQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDHENy-BUdBgSrFm12opYoYJymFIiKIsAux9a0BpIkCn3AcyBYj-kW2bulgAoxGo3G9InjpiZN5gRtxbMmKGTaaxv5jYQGlgfHnREwgkWUZo2ErnNjVy2K8TKMP3sh-TNagfrJqgKqnok0Kp-slcMeWcLtCucb2L5JiVwn2ebsfq1xbX3JHJheSuTIRVGKCZZOYgA-7JpgJDzDBp6akBqcj--L5KfD7gLtr3fy6BRPo1ZCufs1rYH4Momxm5qGUih_ogCbFhr-3TQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBIssrPgo63hsKF1U88bhqIH4JNusvly441tjN71yj5gDSszT_ReTpTW5_MyXotPYGJoNMMgZ_E-SnopA0VbU7i_7F1mYxCNakQlZtMdn-H227YJCVf4G3F5ZAMtV-HIwVsun_gjxwcFlbyw8ona4hLzhA5BY58qX9DgIDInGYH_JBGGcG8fuIrqah4NQQ-nfVmY_dzi1CKtrwd2sJITrdRmzGgI-s0PDmuDIEmaGxz5pgefzYDC_uSyT8ppcVpmSd7xD1dCn82Ug",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA6-JbEzoFqdXjZ9AUw41CAtqd7l9XOatkPGmuqEbud87Nr4AIvm38wNPTHCIvJZXCrA5JC4a6hE5dBxJI44xv8aw_RRSCFdks4K6i3Fdf3xSNkRBHw771JCjpC9EhwQI8Ubzs1B-aV6dQY40_G7H5Q89Nk02n6A_bgIADWDLpcByRUU1KTaj4ct7sAUS2qBYWENMYpVa_EbWnEJsYqcFpoTfjxDqG7jt33RLLnqGu4oAra3iYCdTqHjI60LHONVHsdvXgHuRyzsg"
];

const getBentoClasses = (index) => {
  const mod = index % 5;
  switch (mod) {
    case 0:
      return {
        colSpan: "md:col-span-8 md:row-span-2 min-h-[210px] md:min-h-0",
        overlay: "bg-black/45 group-hover:bg-black/30",
        padding: "p-6 md:p-8",
        titleSize: "text-2xl sm:text-3xl",
        showDesc: true,
      };
    case 1:
      return {
        colSpan: "md:col-span-4 md:row-span-3 min-h-[280px] md:min-h-0",
        overlay: "bg-black/35 group-hover:bg-black/20",
        padding: "p-6",
        titleSize: "text-xl sm:text-2xl",
        showDesc: true,
      };
    case 2:
      return {
        colSpan: "md:col-span-4 md:row-span-1 min-h-[150px] md:min-h-0",
        overlay: "bg-black/45 group-hover:bg-black/30",
        padding: "p-5",
        titleSize: "text-lg sm:text-xl",
        showDesc: false,
      };
    case 3:
      return {
        colSpan: "md:col-span-4 md:row-span-1 min-h-[150px] md:min-h-0",
        overlay: "bg-black/35 group-hover:bg-black/20",
        padding: "p-5",
        titleSize: "text-lg sm:text-xl",
        showDesc: false,
      };
    default:
      return {
        colSpan: "md:col-span-4 md:row-span-1 min-h-[150px]",
        overlay: "bg-black/40 group-hover:bg-black/25",
        padding: "p-5",
        titleSize: "text-lg",
        showDesc: false,
      };
  }
};

const ScrollReveal = ({ children, index, className = "", style = {} }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`reveal-item ${isVisible ? "reveal-active" : ""} ${className}`}
      style={{
        ...style,
        transitionDelay: isVisible ? `${(index % 4) * 80}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
};

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
      <section className="py-16 sm:py-20 lg:py-24 bg-[#FAF6F0]/30 font-['Inter',sans-serif]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4">
            <div className="max-w-xl space-y-2">
              <div className="h-4 bg-[#F5F8F6] rounded w-28 animate-pulse"></div>
              <div className="h-8 bg-[#F5F8F6] rounded w-56 animate-pulse"></div>
            </div>
            <div className="h-5 bg-[#F5F8F6] rounded w-36 animate-pulse hidden sm:block"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[150px]">
            {[0, 1, 2, 3].map((i) => {
              const layout = getBentoClasses(i);
              return (
                <div
                  key={i}
                  className={`bg-[#F5F8F6] rounded-xl border border-[#E8EDEA] animate-pulse flex flex-col justify-end p-6 ${layout.colSpan}`}
                >
                  <div className="h-6 bg-[#E8EDEA] rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-[#E8EDEA] rounded w-1/4"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white font-['Inter',sans-serif] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div>
            <span className="text-tertiary font-label tracking-widest text-[10px] sm:text-xs uppercase font-semibold">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extralight text-[#0D5C2F] tracking-tight leading-tight mt-1">
              Shop by <span className="font-semibold text-[#2C3E37]">Categories</span>
            </h2>
          </div>
          <Link
            href="/categories"
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#2C3E37] hover:text-[#1E2D27] transition-colors duration-300 self-start sm:self-auto pb-1"
          >
            Explore All Categories
            <svg
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
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
          <div className="text-center py-12">
            <p className="text-sm text-[#6B7A75]">No categories available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[150px]">
            {categories.map((cat, index) => {
              const layout = getBentoClasses(index);
              const imgUrl = cat.imageUrl || FALLBACK_IMAGES[index % 5];

              return (
                <ScrollReveal
                  key={cat.id.toString()}
                  index={index}
                  className={layout.colSpan}
                >
                  <Link
                    href={`/products?category_id=${cat.id}`}
                    className="category-card relative group overflow-hidden rounded-xl bg-surface-container-low transition-all duration-700 cursor-pointer w-full h-full block"
                  >
                    <div
                      className="card-image absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out"
                      style={{ backgroundImage: `url('${imgUrl}')` }}
                    ></div>
                    <div className={`overlay absolute inset-0 transition-all duration-500 ${layout.overlay}`}></div>
                    <div className={`absolute inset-0 flex flex-col justify-end ${layout.padding}`}>
                      {index === 0 && (
                        <span className="text-on-primary-container bg-primary-container/80 backdrop-blur-md self-start px-3 py-1 rounded-full text-[10px] font-label uppercase tracking-widest mb-4">
                          Featured Collection
                        </span>
                      )}
                      <h3 className={`${layout.titleSize} text-white font-headline leading-tight`}>
                        {cat.name}
                      </h3>
                      {layout.showDesc && cat.description && (
                        <p className="text-white/80 mt-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 font-body text-sm leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-2 text-white group-hover:gap-4 transition-all duration-300">
                        <span className="font-label text-sm">Explore Collection</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        )}

        {/* Mobile view all button */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2C3E37] hover:text-[#1E2D27] transition-colors"
          >
            Explore All Categories
            <svg
              className="w-3.5 h-3.5"
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