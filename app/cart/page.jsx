"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import CartSection from "@/sections/Cart";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";

export default function CartPage() {
  const { user } = useAuth();
  const { cartItems = [], loading } = useCart();

  if (loading) {
    return (
      <div className="bg-[#f7f6f1] min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-sm font-bold uppercase tracking-[0.3em] text-[#2b2622]/40 animate-pulse pt-28">
          Loading Cart...
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
          <p className="text-[#6f6a65] mb-8">Please login to view your ritual objects.</p>
          <Link href="/login" className="px-10 py-4 bg-[#2b2622] text-white font-bold uppercase tracking-widest text-xs hover:bg-[#b89b5e] transition-all rounded-sm">
            Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#f7f6f1] min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow pt-28 pb-20 px-6 lg:px-12">
        <div className="max-w-[1240px] mx-auto w-full">
          <div className="flex items-center justify-between mb-12 border-b border-[#2b2622]/5 pb-8">
            <h1 className="text-4xl font-bold uppercase tracking-tighter text-[#2b2622]">Your Cart</h1>
            <span className="text-[#b89b5e] font-bold text-sm tracking-widest uppercase">{cartItems.length} Objects</span>
          </div>

          <CartSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
