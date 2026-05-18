"use client";

import React from "react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export default function FeaturedProducts() {
  const handleScrollToProducts = () => {
    const element = document.getElementById("all-products");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="products" className="ritual-section bg-[#f7f6f1] section-layer">
      <div className="ritual-container grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <motion.div>
          <span className="text-[#b89b5e] font-bold text-xs uppercase tracking-widest mb-4 block">
            Featured Collection
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#2b2622]">
            Artisanal Rituals for the Modern Soul
          </h2>
          <p className="text-lg text-[#6f6a65] mb-10 max-w-lg">
            Each piece in our collection is handcrafted using traditional techniques passed down through generations. Designed to ground your energy and elevate your daily rituals.
          </p>
          <button 
            onClick={handleScrollToProducts}
            className="btn-primary px-10 py-4 shadow-premium cursor-pointer"
          >
            View Collection
          </button>
        </motion.div>

        {/* Right Image */}
        <motion.div className="relative aspect-[4/5] bg-neutral-200 shadow-premium rounded-xl overflow-hidden group">
          <img 
            src="/images/sample.jpg" 
            alt="Artisanal Ritual Product" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#e8e1d9] to-transparent mix-blend-multiply opacity-20"></div>
        </motion.div>
      </div>
    </section>
  );
}
