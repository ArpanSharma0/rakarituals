"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { fetchBestSellers } from "@/utils/api";
import { useSocket } from "@/context/SocketContext";

// Fallback high-quality meditation/spiritual themed products for Rakarituals
const FALLBACK_PRODUCTS = [
  {
    _id: "fallback-1",
    name: "Sandalwood Meditation Incense",
    price: 450,
    description: "Traditional hand-rolled incense sticks made with premium organic sandalwood powder and natural essential oils for deep aura cleansing.",
    image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=1200&auto=format&fit=crop",
    countInStock: 10,
    isBestSeller: true
  },
  {
    _id: "fallback-2",
    name: "Sacred Bronze Singing Bowl",
    price: 2400,
    description: "Hand-hammered Himalayan bronze singing bowl emitting soothing, resonant harmonic frequencies to aid meditation and sound healing.",
    image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=1200&auto=format&fit=crop",
    countInStock: 5,
    isBestSeller: true
  },
  {
    _id: "fallback-3",
    name: "Amethyst Crystal Mala",
    price: 1200,
    description: "A consecrated 108-bead amethyst prayer mala to encourage calmness, emotional balance, and enhanced focus during chakra activation.",
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1200&auto=format&fit=crop",
    countInStock: 12,
    isBestSeller: true
  }
];

export default function HeroCarousel() {
  const router = useRouter();
  const socket = useSocket();
  
  const [bestSellers, setBestSellers] = useState(null);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  // Load bestseller products
  const refreshBestSellers = async () => {
    try {
      const data = await fetchBestSellers();
      if (data && Array.isArray(data.products)) {
        const bs = data.products.filter(p => p.isBestSeller);
        setBestSellers(bs.length > 0 ? bs : null);
      } else if (Array.isArray(data)) {
        const bs = data.filter(p => p.isBestSeller);
        setBestSellers(bs.length > 0 ? bs : null);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error fetching best sellers for carousel:", err);
      setError(true);
    }
  };

  useEffect(() => {
    refreshBestSellers();
  }, []);

  // WebSockets Real-time Synchronization
  useEffect(() => {
    if (!socket) return;

    const handleProductUpdated = (updatedProduct) => {
      setBestSellers((prev) => {
        if (!prev) {
          if (updatedProduct.isBestSeller) {
            refreshBestSellers();
          }
          return prev;
        }

        const exists = prev.some((p) => p._id === updatedProduct._id);
        const hasFlagChanged = exists 
          ? !updatedProduct.isBestSeller
          : updatedProduct.isBestSeller;

        if (hasFlagChanged) {
          refreshBestSellers();
          return prev;
        }

        return prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p));
      });
    };

    const handleProductDeleted = (deletedProductId) => {
      setBestSellers((prev) => {
        if (!prev) return prev;
        const exists = prev.some((p) => p._id === deletedProductId);
        if (exists) {
          refreshBestSellers();
        }
        return prev.filter((p) => p._id !== deletedProductId);
      });
    };

    const handleProductCreated = (newProduct) => {
      if (newProduct.isBestSeller) {
        refreshBestSellers();
      }
    };

    socket.on("productUpdated", handleProductUpdated);
    socket.on("productDeleted", handleProductDeleted);
    socket.on("productCreated", handleProductCreated);

    return () => {
      socket.off("productUpdated", handleProductUpdated);
      socket.off("productDeleted", handleProductDeleted);
      socket.off("productCreated", handleProductCreated);
    };
  }, [socket]);

  // Determine active list of products
  const products = bestSellers || FALLBACK_PRODUCTS;

  // Manage Autoplay timer
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % products.length);
    }, 5500); // 5.5s autoplay intervals
  };

  useEffect(() => {
    if (products.length > 0) {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeIndex, products.length]);

  const handleDotClick = (index) => {
    setActiveIndex(index);
  };

  const handleSlideClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  if (products.length === 0) return null;

  const currentProduct = products[activeIndex];

  // Variants for staggered slide text animations
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.95,
        ease: [0.16, 1, 0.3, 1] // smooth custom cubic bezier easing
      }
    }
  };

  return (
    <section 
      className="relative w-full h-[70vh] sm:h-[80vh] lg:h-screen overflow-hidden bg-black select-none"
    >
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
        >
          {/* PRODUCT THUMBNAIL USED AS THE WHOLE BACKGROUND IMAGE */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.img 
              src={currentProduct.image} 
              alt={currentProduct.name}
              initial={{ scale: 1.03 }}
              animate={{ scale: 1.09 }}
              transition={{ duration: 5.5, ease: "easeOut" }}
              className="w-full h-full object-cover"
            />
            {/* DARK READABILITY OVERLAY (coralandsky.in style) */}
            <div className="absolute inset-0 bg-black/45 z-10" />
          </div>

          {/* CENTER OVERLAY: STAGGERED WHITE TEXT & BUTTON */}
          <motion.div 
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto"
          >
            {/* Tag Badge */}
            <div className="split-text-line-wrapper mb-3 lg:mb-5">
              <motion.span 
                variants={itemVariants}
                className="inline-block text-[10px] lg:text-xs font-black tracking-[0.3em] uppercase text-[#b89b5e] bg-black/40 border border-[#b89b5e]/30 px-5 py-2 rounded-full"
              >
                Best Seller
              </motion.span>
            </div>

            {/* Product Name Title */}
            <div className="split-text-line-wrapper mb-4 lg:mb-6">
              <motion.h1 
                variants={itemVariants}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight hero-carousel-title uppercase leading-tight font-heading"
              >
                {currentProduct.name}
              </motion.h1>
            </div>

            {/* Description */}
            <div className="split-text-line-wrapper mb-6 lg:mb-8 max-w-2xl">
              <motion.p 
                variants={itemVariants}
                className="text-xs sm:text-sm lg:text-base hero-carousel-desc leading-relaxed font-body"
              >
                {currentProduct.description}
              </motion.p>
            </div>

            {/* Price Tag & CTA Button */}
            <div className="split-text-line-wrapper flex flex-col items-center gap-4">
              <motion.div 
                variants={itemVariants}
                className="text-lg lg:text-xl font-bold text-[#b89b5e] tracking-tight font-heading"
              >
                ₹{currentProduct.price}
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <button 
                  onClick={() => handleSlideClick(currentProduct._id || currentProduct.id)}
                  className="px-10 py-4 bg-white text-black border-2 border-white font-bold text-xs lg:text-sm uppercase tracking-widest hover:bg-transparent hover:text-white transition-all duration-300 rounded-sm cursor-pointer shadow-lg hover:-translate-y-1 active:translate-y-0"
                >
                  Shop Now
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* CUSTOM DOT PAGINATION (coralandsky.in style circular progress timer) */}
      <div className="flickity-page-dots-custom">
        {products.map((_, index) => (
          <button 
            key={`${index}-${activeIndex}`}
            onClick={() => handleDotClick(index)}
            className={`flickity-page-dot-custom ${index === activeIndex ? "active" : ""}`}
            title={`Slide ${index + 1}`}
            aria-label={`Go to slide ${index + 1}`}
          >
            <svg viewBox="0 0 20 20" className="thb-pagination-svg">
              <circle cx="10" cy="10" r="9" className="bg-circle" fill="none" />
              <circle cx="10" cy="10" r="9" className="progress-circle" fill="none" />
            </svg>
          </button>
        ))}
      </div>
    </section>
  );
}
