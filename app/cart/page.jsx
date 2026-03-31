"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import CartSection from "@/sections/Cart";

export default function CartPage() {
  const { user } = useAuth();
  const { cartItems = [], loading } = useCart();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f7f6f1]">Loading Rituals...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f6f1] text-center px-6">
        <h1 className="text-3xl font-bold uppercase mb-4">Your Path is Quiet</h1>
        <p className="text-[#6f6a65] mb-8">Please login to view your ritual objects.</p>
        <Link href="/login" className="px-10 py-4 bg-[#2b2622] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#b89b5e] transition-all">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f1] pt-32 pb-20 px-6 md:px-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12 border-b border-[#2b2622]/5 pb-8">
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-[#2b2622]">Your Cart</h1>
          <span className="text-[#b89b5e] font-bold text-sm tracking-widest uppercase">{cartItems.length} Objects</span>
        </div>

        <CartSection />
      </div>
    </div>
  );
}
