"use client";

import React from "react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export default function FeaturedProducts() {
  return (
    <section className="w-full bg-[#FBF6F6] py-24 px-6 md:px-20">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center"
        >
          {/* Left: Text */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-black/40 mb-4 font-medium">Featured</p>
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-6 text-black/90">
              Spiritual Essentials
            </h2>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-10 max-w-md">
              Curated with intention. Every item in our collection is designed to deepen your practice, bring calm to your space, and nurture your spiritual growth.
            </p>
            <button className="px-8 py-3.5 bg-black text-white font-semibold uppercase tracking-wider text-sm hover:bg-neutral-800 transition-all duration-300">
              Shop Now
            </button>
          </div>

          {/* Right: Product Image */}
          <div className="bg-black/[0.03] rounded-2xl h-[400px] md:h-[500px] border border-black/5 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-black/[0.02] to-black/[0.06]"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
