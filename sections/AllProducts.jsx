"use client";

import React from "react";
import { motion } from "framer-motion";

const products = [
  { id: 1, name: "Sacred Incense Bundle", price: "$45.00" },
  { id: 2, name: "Meditation Stone Set", price: "$38.00" },
  { id: 3, name: "Ritual Candle Trio", price: "$52.00" },
  { id: 4, name: "Crystal Singing Bowl", price: "$89.00" },
  { id: 5, name: "Herbal Smudge Kit", price: "$34.00" },
  { id: 6, name: "Zen Garden Set", price: "$67.00" },
  { id: 7, name: "Chakra Bracelet", price: "$28.00" },
  { id: 8, name: "Lotus Diffuser", price: "$74.00" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export default function AllProducts() {
  return (
    <section id="products" className="w-full bg-[#FBF6F6] py-24 px-6 md:px-20">
      <div className="max-w-6xl mx-auto">

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-black/40 mb-4 font-medium">Collection</p>
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-black/90">
            All Products
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              variants={fadeInUp}
              className="product-card bg-white rounded-xl p-4 border border-black/[0.04] flex flex-col cursor-pointer group"
            >
              <div className="product-image w-full aspect-square bg-black/[0.03] rounded-lg mb-4 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-transparent to-black/[0.03]"></div>
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-800 mb-1">{product.name}</h3>
              <span className="text-gray-500 font-medium text-sm mt-auto">{product.price}</span>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          variants={fadeInUp}
          className="text-center mt-16"
        >
          <button className="px-10 py-3.5 border border-black text-black font-semibold uppercase tracking-wider text-sm hover:bg-black hover:text-white transition-all duration-300">
            View All
          </button>
        </motion.div>

      </div>
    </section>
  );
}
