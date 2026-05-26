"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, wishlistItems } = useWishlist();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  if (!product) return null;

  const isOutOfStock = !product.countInStock || product.countInStock <= 0;

  const isInWishlist = wishlistItems.some((item) => (item._id || item.id) === (product._id || product.id));

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    toggleWishlist(product._id || product.id);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
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
      transition={{ duration: 0.5 }}
      onClick={() => router.push(`/product/${product._id || product.id}`)}
      className="product-card ritual-card flex flex-col p-3 lg:p-6 cursor-pointer group relative"
    >
      <div className="product-image-container aspect-square relative mb-3 lg:mb-5 overflow-hidden rounded-sm lg:rounded-lg bg-[#f7f6f1]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#2b2622]/20 font-bold text-xs uppercase tracking-widest text-center px-4">
            {product.name}
          </div>
        )}
        <div className="absolute inset-0 bg-[#b89b5e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {isOutOfStock && (
          <div className="absolute top-2 left-2 bg-[#2b2622]/80 text-white text-[7px] lg:text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
            Out of Stock
          </div>
        )}
        
        {/* Wishlist Heart Button overlay */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-[#2b2622] hover:bg-white hover:scale-110 active:scale-90 transition-all cursor-pointer"
          title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <svg
            className="w-3.5 h-3.5 transition-transform"
            fill={isInWishlist ? "var(--accent)" : "none"}
            stroke={isInWishlist ? "var(--accent)" : "currentColor"}
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="text-[10px] lg:text-xs font-bold uppercase tracking-wider mb-1 lg:mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex justify-between items-center mt-auto gap-1">
          <span className="text-sm lg:text-xl font-bold text-[#2b2622] tracking-tighter">
            ₹{product.price}
          </span>
          {isOutOfStock ? (
            <span className="text-[8px] lg:text-[10px] font-black tracking-wider lg:tracking-[0.2em] text-red-400 uppercase">
              Sold Out
            </span>
          ) : (
            <button 
              onClick={handleAddToCart}
              disabled={adding}
              className={`text-[8px] lg:text-[10px] font-black tracking-wider lg:tracking-[0.2em] text-[var(--accent)] hover:text-[#2b2622] transition-colors uppercase cursor-pointer ${adding ? 'opacity-50' : ''}`}
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
