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
    <section id="products" className="w-full bg-[#f7f6f1] py-24 px-6 md:px-20 section-layer">
      <div className="max-w-6xl mx-auto">

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <p className="text-[#b89b5e] text-xs uppercase tracking-[0.3em] mb-4 font-bold">Collection</p>
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-[#2b2622]">
            All Products
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              variants={fadeInUp}
              className="product-card flex flex-col cursor-pointer group"
            >
              <div className="product-image-container w-full aspect-square bg-[#2b2622]/[0.03] rounded-t-lg mb-4">
                <div className="product-image w-full h-full relative">
                  <div className="absolute inset-0 bg-[#b89b5e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[#2b2622]/10 font-bold text-xs uppercase tracking-widest">Ritual Object</div>
                </div>
              </div>
              <div className="p-4 pt-1 flex flex-col flex-grow">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#2b2622] mb-1">{product.name}</h3>
                <span className="text-[#6f6a65] font-semibold text-xs mt-auto">{product.price}</span>
              </div>
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
          <button className="px-12 py-3.5 bg-[#2b2622] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#b89b5e] transition-all transform hover:-translate-y-1 shadow-md">
            View All
          </button>
        </motion.div>

      </div>
    </section>
  );
}
