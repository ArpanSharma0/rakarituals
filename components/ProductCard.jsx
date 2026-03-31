"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  if (!product) return null;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }

    setAdding(true);
    try {
      await addToCart(product._id || product.id);
    } catch (err) {
      alert(err.message || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="product-card flex flex-col bg-[#e8e1d9] text-[#2b2622] rounded-2xl p-5 shadow-sm border border-[#dcd4cb] transition-all duration-300 group h-full"
    >
      <div className="product-image-container aspect-square relative mb-5 overflow-hidden rounded-xl bg-[#f7f6f1]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#2b2622]/20 font-bold text-xs uppercase tracking-widest text-center px-4">
            {product.name}
          </div>
        )}
        <div className="absolute inset-0 bg-[#b89b5e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-[#b89b5e] font-bold text-xs tracking-widest">
            ₹{product.price}
          </span>
          <button 
            onClick={handleAddToCart}
            disabled={adding}
            className={`text-[10px] font-black tracking-[0.2em] text-[#b89b5e] hover:text-[#2b2622] transition-colors uppercase ${adding ? 'opacity-50' : ''}`}
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
