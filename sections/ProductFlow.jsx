"use client";

import React from "react";

export default function ProductFlow() {
  return (
    <section className="relative z-20 w-full bg-[#FBF6F6] text-black pt-24 pb-40">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-12 text-center">Featured Collection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-8 shadow-sm border border-black/5 h-96 flex flex-col justify-center">
            <h3 className="text-2xl font-medium mb-4 uppercase">Mindful Mornings</h3>
            <p className="text-black/60 mb-8 max-w-md">Start your day with clarity and purpose. Our new collection curated for morning rituals.</p>
            <button className="self-start px-6 py-3 border border-black text-black font-semibold uppercase tracking-wider hover:bg-black hover:text-white transition-colors">Discover</button>
          </div>
          <div className="bg-black/5 rounded-lg border border-black/5 h-96"></div>
        </div>
      </div>
    </section>
  );
}
