"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { updateCartItem, placeOrder } from "@/utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartSection() {
  const { cartItems = [], removeFromCart, refreshCart } = useCart();
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setUpdating(true);
    try {
      await placeOrder({ items: cartItems, totalPrice: subtotal });
      await refreshCart();
      alert("Order placed successfully!");
      router.push("/orders");
    } catch (err) {
      alert(err.message || "Failed to place order");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateQuantity = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      await updateCartItem(productId, newQty, token);
      await refreshCart();
    } catch (err) {
      alert(err.message || "Could not update quantity");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (err) {
      alert(err.message || "Could not remove item");
    }
  };

  const subtotal = Array.isArray(cartItems) ? cartItems.reduce((acc, item) => {
    const priceRaw = item.product?.price || 0;
    const price = typeof priceRaw === "string" 
      ? Number.parseFloat(priceRaw.replace(/[^0-9.]/g, "")) 
      : Number(priceRaw);
    return acc + (isNaN(price) ? 0 : price) * (item.quantity || 1);
  }, 0) : 0;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[32px] border border-[#2b2622]/5 shadow-sm">
        <p className="text-[#6f6a65] mb-8 font-medium italic">No ritual objects selected.</p>
        <Link href="/" className="text-[#b89b5e] font-bold uppercase tracking-widest text-xs hover:underline decoration-2 underline-offset-8">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {cartItems.map((item, index) => (
        <motion.div
          key={item.product._id || item.product.id || `cart-item-${index}`}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center gap-8 bg-white p-6 md:p-8 rounded-[32px] border border-[#2b2622]/5 shadow-sm"
        >
          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#f8f7f4] rounded-24 overflow-hidden flex-shrink-0">
            {item.product.image ? (
              <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#2b2622]/20 font-bold text-xs uppercase text-center p-2">
                {item.product.name}
              </div>
            )}
          </div>
          
          <div className="flex-grow text-center md:text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2b2622] mb-1">{item.product.name}</h3>
            <p className="text-[#b89b5e] font-bold text-xs tracking-widest mb-4">₹{item.product.price}</p>
            
            <div className="flex items-center justify-center md:justify-start gap-4">
              <button 
                onClick={() => handleUpdateQuantity(item.product._id, item.quantity, -1)}
                disabled={updating}
                className={`w-8 h-8 rounded-full border border-[#2b2622]/10 flex items-center justify-center text-[#2b2622] hover:bg-[#2b2622] hover:text-white transition-all ${updating ? 'opacity-50' : ''}`}
              >
                -
              </button>
              <span className="text-xs font-bold text-[#2b2622] w-4 text-center">{item.quantity}</span>
              <button 
                onClick={() => handleUpdateQuantity(item.product._id, item.quantity, 1)}
                disabled={updating}
                className={`w-8 h-8 rounded-full border border-[#2b2622]/10 flex items-center justify-center text-[#2b2622] hover:bg-[#2b2622] hover:text-white transition-all ${updating ? 'opacity-50' : ''}`}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4 min-w-[120px]">
            <span className="text-sm font-bold text-[#2b2622]">
              ₹{((typeof item.product.price === "string" 
                  ? Number.parseFloat(item.product.price.replace(/[^0-9.]/g, "")) 
                  : Number(item.product.price)) * item.quantity).toFixed(2)}
            </span>
            <button 
              onClick={() => handleRemove(item.product._id)}
              className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
            >
              Remove
            </button>
          </div>
        </motion.div>
      ))}

      <div className="mt-12 bg-[#2b2622] text-white p-10 rounded-[32px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Subtotal (INR)</p>
          <p className="text-4xl font-bold tracking-tighter">₹{subtotal.toFixed(2)}</p>
        </div>
        <button 
          onClick={handleCheckout}
          disabled={updating || cartItems.length === 0}
          className="w-full md:w-auto px-12 py-5 bg-[#b89b5e] text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-white hover:text-[#2b2622] transition-all transform hover:-translate-y-1 shadow-xl disabled:opacity-50"
        >
          {updating ? "Processing..." : "Checkout"}
        </button>
      </div>
    </div>
  );
}
