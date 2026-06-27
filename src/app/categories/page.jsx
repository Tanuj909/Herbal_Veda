"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
    case 4:
      return {
        colSpan: "md:col-span-8 md:row-span-1 min-h-[150px] md:min-h-0",
        overlay: "bg-black/50 group-hover:bg-black/30",
        padding: "px-6 py-5 md:px-8",
        titleSize: "text-xl sm:text-2xl",
        showDesc: true,
        flexRow: true,
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
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body">
      <Navbar />

      <main className="flex-grow w-full px-4 sm:px-8 md:px-12 pt-24 sm:pt-28 pb-24">
        {/* Hero Section & Filters */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-outline-variant/20 pb-8">
            <div className="max-w-2xl">
              <span className="text-tertiary font-label tracking-widest text-sm uppercase font-semibold">
                Curated Collections
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl text-on-surface mt-2 leading-tight whitespace-nowrap">
                Explore Nature's Finest
              </h1>
            </div>
            {/* <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="flex items-center gap-2 px-6 py-3 bg-surface-container rounded-full text-on-surface-variant cursor-pointer hover:bg-surface-container-high transition-colors text-sm font-label"
              >
                <span className="material-symbols-outlined text-lg">tune</span>
                Filter Products
              </Link>
            </div> */}
          </div>
        </header>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[150px]">
            {[1, 2, 3, 4, 5].map((i, idx) => {
              const layout = getBentoClasses(idx);
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
        ) : categories.length === 0 ? (
          /* Empty Categories State */
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8EDEA] p-8 shadow-soft-shadow flex flex-col items-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#F5F8F6] text-[#6B7A75] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">category</span>
            </div>
            <h3 className="text-base font-semibold text-[#242926]">No categories found</h3>
            <p className="text-xs text-[#6B7A75] mt-1.5 text-center">
              Our botanical catalogs are currently updating. Please check back later.
            </p>
          </div>
        ) : (
          /* Bento Grid Categories */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[150px]">
            {categories.map((cat, index) => {
              const layout = getBentoClasses(index);
              const imgUrl = cat.image_url || FALLBACK_IMAGES[index % 5];

              if (layout.flexRow) {
                // Wide Card Layout (Index 4)
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
                      <div className="absolute inset-0 px-8 py-6 md:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-2xl sm:text-3xl text-white font-headline font-bold">{cat.name}</h3>
                          {cat.description && (
                            <p className="text-white/80 font-body text-sm mt-1 max-w-md line-clamp-1">{cat.description}</p>
                          )}
                        </div>
                        <span className="bg-white text-[#2C3E37] px-6 py-2 rounded-full font-label text-sm hover:scale-105 transition-transform flex-shrink-0">
                          Browse Collection
                        </span>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              }

              // Standard Cards Layout (Index 0, 1, 2, 3)
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
                      {index % 5 === 0 && (
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
      </main>

      <Footer />
    </div>
  );
}
