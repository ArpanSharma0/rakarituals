"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCategories, fetchProductsByCategory } from "@/utils/api";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";

export default function CategoriesPage() {
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCategories();
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    };
    load();
  }, []);

  const handleCategoryClick = async (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
      setProducts([]);
      return;
    }
    setSelectedCategory(categoryName);
    setLoadingProducts(true);
    try {
      const data = await fetchProductsByCategory(categoryName);
      if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between font-sans">
      <Navbar />
      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1240px] mx-auto w-full">

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[10px] text-[#6f6a65]/60 mb-6 font-black uppercase tracking-widest">
            <Link href="/" className="hover:text-[#FB9E5B] transition-colors">Home</Link>
            <span>&gt;</span>
            <span className="text-[#151515]">Categories</span>
          </div>

          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-[#151515] tracking-tight">
              Shop by Category
            </h1>
            <p className="text-sm text-[#615959] mt-2 font-light">
              Browse our collection organized by category
            </p>
          </motion.div>

          {/* Loading State */}
          {!categories && !error && (
            <div className="flex items-center justify-center py-20">
              <div className="text-sm font-bold uppercase tracking-[0.3em] text-[#151515]/40 animate-pulse">
                Loading categories...
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <p className="text-[#615959] mb-6 font-medium">Failed to load categories.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-[#FB9E5B] font-bold uppercase tracking-widest text-xs hover:underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Category Grid */}
          {categories && categories.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {categories.map((cat, index) => {
                const isActive = selectedCategory === cat.name;
                return (
                  <motion.button
                    key={cat.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`group relative overflow-hidden rounded-lg border transition-all duration-300 cursor-pointer text-left ${
                      isActive
                        ? "border-[#FB9E5B] shadow-[0_4px_20px_rgba(251,158,91,0.15)]"
                        : "border-[#e9e9e9] hover:border-[#FB9E5B]/50 hover:shadow-sm"
                    }`}
                  >
                    {/* Category Image */}
                    <div className="aspect-[4/3] overflow-hidden bg-[#f8f8f8]">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#151515]/10 text-4xl font-bold">
                          {cat.name?.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Category Info */}
                    <div className="px-4 py-3.5">
                      <h3 className="text-[13px] md:text-sm font-semibold text-[#151515] tracking-wide capitalize">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-[#615959] mt-0.5">
                        {cat.count} {cat.count === 1 ? "product" : "products"}
                      </p>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="categoryIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FB9E5B]"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {categories && categories.length === 0 && (
            <div className="text-center py-20 bg-[#fafafa] rounded-lg border border-[#e9e9e9]">
              <p className="text-[#615959] mb-6 font-medium">No categories found.</p>
              <Link
                href="/"
                className="text-[#FB9E5B] font-bold uppercase tracking-widest text-xs hover:underline"
              >
                Back to Home
              </Link>
            </div>
          )}

          {/* Products Section (expanded when a category is selected) */}
          <AnimatePresence mode="wait">
            {selectedCategory && (
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="mt-10"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6 border-b border-[#e9e9e9] pb-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-[#151515] capitalize">
                      {selectedCategory}
                    </h2>
                    <p className="text-xs text-[#615959] mt-1">
                      {products.length} {products.length === 1 ? "item" : "items"} found
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setProducts([]);
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-[#615959] hover:text-[#FB9E5B] transition-colors cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>

                {/* Loading Products */}
                {loadingProducts && (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-sm font-bold uppercase tracking-[0.3em] text-[#151515]/40 animate-pulse">
                      Loading products...
                    </div>
                  </div>
                )}

                {/* Products Grid */}
                {!loadingProducts && products.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product, index) => (
                      <motion.div
                        key={product._id || product.id || index}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04, duration: 0.35 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* No Products */}
                {!loadingProducts && products.length === 0 && (
                  <div className="text-center py-16 bg-[#fafafa] rounded-lg border border-[#e9e9e9]">
                    <p className="text-[#615959] font-medium text-sm">
                      No products found in this category.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
      <Footer />
    </div>
  );
}
