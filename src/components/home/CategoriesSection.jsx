"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

// Static premium botanical categories as fallbacks
const MOCK_CATEGORIES = [
  {
    id: "mock-1",
    name: "Essential Oils",
    slug: "essential-oils",
    description: "Pure steam-distilled extracts for holistic aroma wellness.",
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "mock-2",
    name: "Herbal Teas",
    slug: "herbal-teas",
    description: "Whole flower, organic infusions for daily calm and digestion.",
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "mock-3",
    name: "Organic Skincare",
    slug: "organic-skincare",
    description: "Cold-pressed face serums and nutrient-dense clay cleaners.",
    imageUrl: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "mock-4",
    name: "Wellness Elixirs",
    slug: "wellness-elixirs",
    description: "Adaptogenic honey mixtures, herbal tonics, and powders.",
    imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600",
  },
];

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories?structure=flat");
        if (response.data && response.data.success && response.data.data.length > 0) {
          // Merge API category list with mock imagery details
          const merged = response.data.data.slice(0, 4).map((apiCat, index) => {
            const mock = MOCK_CATEGORIES[index % MOCK_CATEGORIES.length];
            return {
              id: apiCat.id,
              name: apiCat.name,
              slug: apiCat.slug,
              description: mock.description,
              imageUrl: mock.imageUrl,
            };
          });
          setCategories(merged);
        } else {
          setCategories(MOCK_CATEGORIES);
        }
      } catch (error) {
        console.error("Failed to load categories from API:", error);
        setCategories(MOCK_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-20 bg-background font-body">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Simplified Section Header (Max 2 headings/lines) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface">
              Shop by Categories
            </h2>
            <p className="text-on-surface-variant mt-2 text-sm font-light">
              Explore pure concentrates, whole herbs, and handcrafted wellness solutions created for complete mind-body equilibrium.
            </p>
          </div>
          <Link
            href="#"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-container transition-colors self-start md:self-auto"
          >
            Explore All Categories
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </Link>
        </div>

        {/* Categories Grid - Compact & Clean Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-outline-variant/35 bg-white overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col h-[340px] group"
            >
              {/* Image Container (Without Icon Overlay) */}
              <div className="relative h-48 w-full overflow-hidden bg-surface-container-low">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-start">
                <div>
                  <h3 className="text-lg font-headline font-bold text-on-surface mb-1.5">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-light leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="inline-flex items-center gap-0.5 text-xs font-bold text-primary hover:text-primary-container transition-colors mt-3 self-start group/btn"
                >
                  Shop Category
                  <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover/btn:translate-x-1">
                    chevron_right
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
