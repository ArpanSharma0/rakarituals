"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { fetchFeaturedProduct } from "@/utils/api";

export default function FeaturedProducts() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await fetchFeaturedProduct();
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch featured product:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  // Don't render the section if there's no featured product or still loading
  if (loading) {
    return (
      <section id="products" className="ritual-section bg-[#f7f6f1] section-layer">
        <div className="ritual-container flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#b89b5e] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  if (!product) return null;

  return (
    <section id="products" className="ritual-section bg-[#f7f6f1] section-layer">
      <div className="ritual-container grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <motion.div>
          <span className="text-[#b89b5e] font-bold text-xs uppercase tracking-widest mb-4 block">
            Featured Collection
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#2b2622]">
            {product.name}
          </h2>
          <p className="text-lg text-[#6f6a65] mb-6 max-w-lg">
            {product.description}
          </p>
          <div className="flex items-baseline gap-2 mb-10">
            <span className="text-sm font-bold text-[#b89b5e]">₹</span>
            <span className="text-3xl font-bold text-[#2b2622] tracking-tighter">{product.price}</span>
          </div>
          <Link 
            href={`/product/${product._id}`}
            className="btn-primary px-10 py-4 shadow-premium cursor-pointer inline-block"
          >
            View Product
          </Link>
        </motion.div>

        {/* Right Image */}
        <motion.div className="relative aspect-[4/5] bg-neutral-200 shadow-premium rounded-xl overflow-hidden group">
          <img 
            src={product.image || "/images/sample.jpg"} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#e8e1d9] to-transparent mix-blend-multiply opacity-20"></div>
        </motion.div>
      </div>
    </section>
  );
}
