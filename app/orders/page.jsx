"use client";

import React, { useEffect, useState } from "react";
import { getMyOrders } from "@/utils/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      if (!user) return;
      try {
        const data = await getMyOrders();
        setOrders(data || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen pt-40 px-6 flex items-center justify-center bg-[#fdfaf5]">
        <div className="text-sm font-bold uppercase tracking-[0.3em] text-[#2b2622]/40 animate-pulse">
          Loading your rituals...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-40 pb-20 px-6 bg-[#fdfaf5]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center md:text-left"
        >
          <span className="text-[#b89b5e] font-black tracking-[0.4em] uppercase text-[10px] block mb-4">Account History</span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-[#2b2622]">Your Orders</h1>
        </motion.div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-[#2b2622]/5 shadow-sm">
            <p className="text-[#6f6a65] mb-8 font-medium italic">No ritual history found.</p>
            <Link href="/" className="text-[#b89b5e] font-bold uppercase tracking-widest text-xs hover:underline decoration-2 underline-offset-8">
              Start your journey
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-[32px] border border-[#2b2622]/5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-white/50 bg-[#2b2622] inline-block px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                      #{order._id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-[#6f6a65] font-medium">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {order.items?.map((item, i) => (
                        <div key={i} className="text-[10px] font-bold uppercase bg-[#f8f7f4] px-3 py-1 rounded-lg text-[#2b2622]/60">
                          {item.product?.name} x {item.quantity}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:text-right flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b89b5e] mb-1">Total Amount</p>
                      <p className="text-2xl font-bold tracking-tight text-[#2b2622]">₹{order.totalPrice?.toFixed(2)}</p>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-green-500 mt-4 md:mt-0 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                       Confirmed
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
