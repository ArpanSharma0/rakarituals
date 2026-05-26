"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlistItems = [], loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="bg-[#f7f6f1] min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-sm font-bold uppercase tracking-[0.3em] text-[#2b2622]/40 animate-pulse pt-28">
          Loading Wishlist...
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#f7f6f1] min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
          <h1 className="text-3xl font-bold uppercase mb-4">Your Path is Quiet</h1>
          <p className="text-[#6f6a65] mb-8">Please login to view your wishlist objects.</p>
          <Link href="/login" className="px-10 py-4 bg-[#2b2622] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#b89b5e] transition-all rounded-sm">
            Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id || product.id);
      alert(`${product.name} added to cart!`);
    } catch (err) {
      alert(err.message || "Could not add to cart");
    }
  };

  return (
    <div className="bg-[#f7f6f1] min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow pt-28 pb-20 px-6 lg:px-12">
        <div className="max-w-[1240px] mx-auto w-full">
          <div className="flex items-center justify-between mb-12 border-b border-[#2b2622]/5 pb-8">
            <h1 className="text-4xl font-bold uppercase tracking-tighter text-[#2b2622]">Your Wishlist</h1>
            <span className="text-[#b89b5e] font-bold text-sm tracking-widest uppercase">{wishlistItems.length} Objects</span>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[32px] border border-[#2b2622]/5 shadow-sm">
              <p className="text-[#6f6a65] mb-8 font-medium italic">Your wishlist is empty.</p>
              <Link href="/#all-products" className="text-[#b89b5e] font-bold uppercase tracking-widest text-xs hover:underline decoration-2 underline-offset-8">
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
              {wishlistItems.map((product, index) => (
                <motion.div
                  key={product._id || product.id || `wish-item-${index}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col bg-white p-3 lg:p-6 rounded-sm border border-[#e9e9e9]"
                >
                  <div 
                    onClick={() => router.push(`/product/${product._id || product.id}`)}
                    className="aspect-square bg-[#f8f7f4] rounded-sm overflow-hidden mb-3 lg:mb-5 relative group cursor-pointer"
                  >
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#2b2622]/20 font-bold text-xs uppercase text-center p-2">
                        {product.name}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow flex flex-col">
                    <h3 className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-[#2b2622] mb-1 lg:mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-[#b89b5e] font-bold text-sm lg:text-base tracking-widest mb-4">₹{product.price}</p>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-auto border-t border-[#e9e9e9] pt-4">
                    <button 
                      onClick={() => removeFromWishlist(product._id || product.id)}
                      className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.countInStock || product.countInStock <= 0}
                      className="px-4 py-2 bg-[#2b2622] text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-[#b89b5e] transition-all disabled:opacity-30 cursor-pointer"
                    >
                      {!product.countInStock || product.countInStock <= 0 ? "Out" : "Add"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
