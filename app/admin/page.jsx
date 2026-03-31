"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProducts, getMyOrders } from "@/utils/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    bestSellers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [productsData, ordersData] = await Promise.all([
          fetchProducts(),
          getMyOrders(),
        ]);

        const products = productsData.products || [];
        const orders = ordersData || [];

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          bestSellers: products.filter((p) => p.isBestSeller).length,
        });
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const StatCard = ({ title, value, subtitle, trend }) => (
    <div className="bg-white p-8 rounded-[32px] border border-[#dcd4cb] hover:border-[#b89b5e] hover:shadow-[0_20px_50px_rgba(184,155,94,0.1)] transition-all duration-500 group relative overflow-hidden">
      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6f6a65]/60 mb-6 flex items-center gap-2">
          <span className="w-1 h-1 bg-[#b89b5e] rounded-full"></span>
          {title}
        </p>
        <div className="flex items-baseline gap-3">
          <h3 className="text-6xl font-bold text-[#2b2622] tracking-tighter">
            {loading ? (
              <span className="inline-block w-16 h-12 bg-[#e8e1d9] animate-pulse rounded-xl"></span>
            ) : (
              value
            )}
          </h3>
          <span className="text-xs font-bold text-[#b89b5e] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
            {subtitle}
          </span>
        </div>
      </div>
      {/* Decorative Background Element */}
      <div className="absolute -right-4 -bottom-4 text-8xl opacity-[0.03] group-hover:opacity-[0.07] transition-all group-hover:scale-110 rotate-12 select-none pointer-events-none font-black text-[#2b2622]">
        {title[0]}
      </div>
    </div>
  );

  const QuickAction = ({ title, desc, icon, href, dark = false }) => (
    <button 
      onClick={() => router.push(href)}
      className={`p-10 rounded-[48px] text-left transition-all duration-700 group relative overflow-hidden flex flex-col justify-between min-h-[280px] ${
        dark 
        ? "bg-[#2b2622] text-[#f7f6f1] hover:bg-[#b89b5e]" 
        : "bg-white text-[#2b2622] border border-[#dcd4cb] hover:border-[#b89b5e]"
      }`}
    >
      <div className="relative z-10">
        <span className={`text-[10px] font-black uppercase tracking-[0.4em] mb-6 block ${dark ? "text-[#b89b5e]" : "text-[#6f6a65]"}`}>
          Quick Path
        </span>
        <h2 className="text-4xl font-bold tracking-tighter mb-4 leading-none">{title}</h2>
        <p className={`text-sm max-w-[200px] leading-relaxed transition-opacity ${dark ? "opacity-50 group-hover:opacity-100" : "opacity-60 group-hover:opacity-100"}`}>
          {desc}
        </p>
      </div>
      
      <div className="relative z-10 flex items-center justify-between">
        <span className={`text-[10px] font-black uppercase tracking-widest ${dark ? "text-white" : "text-[#2b2622]"}`}>
          Enter Section →
        </span>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${
          dark ? "border-white/10 group-hover:border-white/40" : "border-[#dcd4cb] group-hover:border-[#b89b5e]"
        }`}>
          {icon}
        </div>
      </div>

      {/* Hover Background Pattern */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[#b89b5e] font-black tracking-[0.5em] uppercase text-[10px] block mb-4">Temple Analytics</span>
          <h1 className="text-6xl font-bold tracking-tighter text-[#2b2622]">Good Morning, Admin</h1>
        </div>
        <div className="bg-[#e8e1d9] px-6 py-3 rounded-2xl border border-[#dcd4cb] flex items-center gap-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#2b2622]">Systems Live</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <StatCard 
          title="Inventory" 
          value={stats.totalProducts} 
          subtitle="Total Rituals"
        />
        <StatCard 
          title="Orders" 
          value={stats.totalOrders} 
          subtitle="Ritual Journeys"
        />
        <StatCard 
          title="Trending" 
          value={stats.bestSellers} 
          subtitle="Most Sacred"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <QuickAction 
          title="Manage Catalog" 
          desc="Refine prices, stock levels, and divine availability."
          icon="📦"
          href="/admin/products"
          dark
        />
        <QuickAction 
          title="New Ritual" 
          desc="Expand your sacred collection with a new item."
          icon="✨"
          href="/admin/create-product"
        />
      </div>
    </div>
  );
}
