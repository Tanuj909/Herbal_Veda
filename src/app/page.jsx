"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Sections */}
      <main className="flex-1">
        {/* Immersive Hero Header */}
        <HeroSection />

        {/* Categories Carousel / Grid */}
        <CategoriesSection />



        {/* Curated Products */}
        <FeaturedProducts />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
