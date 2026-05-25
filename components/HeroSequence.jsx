"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fetchBestSellers } from "@/utils/api";
import ProductCard from "@/components/ProductCard";
import { useSocket } from "@/context/SocketContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function HeroSequence() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const scrollTrackRef = useRef(null);
  const frameCount = 160;

  const [bestSellers, setBestSellers] = useState(null);
  const [error, setError] = useState(false);

  const refreshBestSellers = async () => {
    try {
      const data = await fetchBestSellers();
      if (data && Array.isArray(data.products)) {
        setBestSellers(data.products.slice(0, 4));
      } else if (Array.isArray(data)) {
        setBestSellers(data.slice(0, 4));
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error refreshing best sellers:", err);
      setError(true);
    }
  };

  useEffect(() => {
    refreshBestSellers();
  }, []);

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleProductUpdated = (updatedProduct) => {
      setBestSellers((prevBestSellers) => {
        if (!prevBestSellers) return prevBestSellers;

        const existingProduct = prevBestSellers.find((p) => p._id === updatedProduct._id);
        const flagChanged = existingProduct 
          ? existingProduct.isBestSeller !== updatedProduct.isBestSeller 
          : updatedProduct.isBestSeller;

        if (flagChanged) {
          refreshBestSellers();
          return prevBestSellers;
        }

        return prevBestSellers.map((p) => (p._id === updatedProduct._id ? updatedProduct : p));
      });
    };

    const handleProductDeleted = (deletedProductId) => {
      setBestSellers((prevBestSellers) => {
        if (!prevBestSellers) return prevBestSellers;
        const exists = prevBestSellers.some((p) => p._id === deletedProductId);
        if (exists) {
          refreshBestSellers();
        }
        return prevBestSellers.filter((p) => p._id !== deletedProductId);
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

  // Framer Motion Scroll Tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Sub-elements parallax up from bottom
  const subOpacity = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);
  const subY = useTransform(scrollYProgress, [0.05, 0.15], [50, 0]);
  // Fade out sub-elements before best sellers appear
  const subFadeOut = useTransform(scrollYProgress, [0.35, 0.45], [1, 0]);

  // Canvas Sequence Fade Out (later, after best sellers)
  const canvasOpacity = useTransform(scrollYProgress, [0.75, 0.9], [1, 0]);

  // Transition Background
  const backgroundColor = useTransform(scrollYProgress, [0.75, 0.9], ["#000000", "#f7f6f1"]);

  // Morph main text (Center -> Top Left Navbar Logo)
  const moveProgress = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const top = useTransform(moveProgress, p => `calc(${50 - 50 * p}% + ${36 * p}px)`); 
  const left = useTransform(moveProgress, p => `calc(${50 - 50 * p}% + ${32 * p}px)`); 
  const x = useTransform(scrollYProgress, [0, 0.2], ["-50%", "0%"]);
  const y = useTransform(scrollYProgress, [0, 0.2], ["-50%", "0%"]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);
  const heroOpacity = useTransform(scrollYProgress, [0.18, 0.22], [1, 0]);

  // === BEST SELLERS: Parallax Slide (smooth on scroll) ===
  const bsX = useTransform(scrollYProgress, [0.4, 0.55], [-150, 0]); // Container slide
  const bsTitleX = useTransform(scrollYProgress, [0.4, 0.55], ["-40%", "0%"]); // Title parallax
  const bsCardsX = useTransform(scrollYProgress, [0.4, 0.55], ["-20%", "0%"]); // Cards parallax
  const bsOpacity = useTransform(scrollYProgress, [0.4, 0.42], [0, 1]); // Snap in quickly at start
  const bsFadeOut = useTransform(scrollYProgress, [0.75, 0.85], [1, 0]); // Smooth slide out
  
  // Micro Parallax for Background
  const bgParallax = useTransform(scrollYProgress, [0, 1], [0, -60]);

  useEffect(() => {
    // Clear any previous preloaded images to prevent duplicates (especially in React StrictMode)
    imagesRef.current = [];
    
    // 1. Preload images (No React State, No re-renders)
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const index = i.toString().padStart(3, "0");
        img.src = `/assets/sequences/ezgif-frame-${index}.jpg`;
        imagesRef.current.push(img);
    }
  }, []);

  // === SCROLL HIJACKING: Convert vertical scroll to horizontal when hovering over Best Sellers ===
  useEffect(() => {
    const scrollContainer = scrollTrackRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e) => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      const maxScroll = scrollWidth - clientWidth;
      const atLeftEdge = scrollLeft <= 0;
      const atRightEdge = scrollLeft >= maxScroll - 1;

      // If at the left edge and scrolling left (up), let page scroll
      if (atLeftEdge && e.deltaY < 0) return;
      // If at the right edge and scrolling right (down), let page scroll
      if (atRightEdge && e.deltaY > 0) return;

      // Otherwise, hijack: prevent page scroll & scroll horizontally
      e.preventDefault();
      e.stopPropagation();
      scrollContainer.scrollLeft += e.deltaY;
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });
    return () => scrollContainer.removeEventListener("wheel", handleWheel);
  }, []);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false }); // Optimize performance

    let currentFrame = 0;
    let renderRequested = false;

    const render = (frameIndex) => {
      // Release the render lock immediately so subsequent frames can be requested
      renderRequested = false;

      const img = imagesRef.current[frameIndex];
      if (!img) return;

      // If the image hasn't loaded yet, register an onload callback to render it when ready
      if (!img.complete || img.naturalWidth === 0) {
        img.onload = () => {
          if (currentFrame === frameIndex) {
            requestRender(frameIndex);
          }
        };
        return;
      }
      
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      const widthDPR = rect.width * dpr;
      const heightDPR = rect.height * dpr;

      // Update canvas resolution only if changed
      if (canvas.width !== widthDPR || canvas.height !== heightDPR) {
          canvas.width = widthDPR;
          canvas.height = heightDPR;
      }
      
      // Clear before drawing
      ctx.fillStyle = "#FBF6F6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgRatio > canvasRatio) {
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgRatio;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
      } else {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const requestRender = (frameIndex) => {
      if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(() => render(frameIndex));
      }
    };

    // Draw initial frame as soon as it's ready
    const tryRenderInitial = setInterval(() => {
        const firstImg = imagesRef.current[0];
        if (firstImg && firstImg.complete && firstImg.naturalWidth > 0) {
            requestRender(0);
            clearInterval(tryRenderInitial);
        }
    }, 50);

    const resizeHandler = () => requestRender(currentFrame);
    window.addEventListener("resize", resizeHandler);

    // GSAP ScrollTrigger
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: () => `+=${window.innerHeight * 1.2}`,
      scrub: 0.8,
      onUpdate: (self) => {
        const progress = self.progress;
        // Map progress 0 -> 1 to frame index 0 -> 159
        const frameIndex = Math.floor(progress * (frameCount - 1));
        if (frameIndex !== currentFrame) {
            currentFrame = frameIndex;
            requestRender(currentFrame);
        }
      }
    });

    return () => {
      clearInterval(tryRenderInitial);
      window.removeEventListener("resize", resizeHandler);
    };
  }, { scope: containerRef });

  const handleScrollToProducts = () => {
    const element = document.getElementById("all-products");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.section ref={containerRef} style={{ backgroundColor }} className="relative w-full h-[500vh]">
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        
        {/* CANVAS BACKGROUND */}
        <motion.div style={{ opacity: canvasOpacity, y: bgParallax }} className="absolute inset-0 w-full h-full z-0">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full block scale-105"
          />
        </motion.div>

        {/* OVERLAY FOR READABILITY */}
        <motion.div style={{ opacity: canvasOpacity }} className="absolute inset-0 bg-black/20 z-[5] pointer-events-none"></motion.div>

        {/* HERO TEXT: Subheading and Button */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center pointer-events-none pb-20">
          <motion.div 
            style={{ opacity: subFadeOut, y: subY }}
            className="hero-text pointer-events-auto drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] mt-[10vh]"
          >
            <motion.div style={{ opacity: subOpacity }}>
              <p className="text-lg md:text-xl font-medium tracking-widest uppercase mb-8 border border-[#b89b5e] px-6 py-2 inline-block text-[#b89b5e] bg-black/10 backdrop-blur-sm">
                Meditate and Grow
              </p>
              <br />
              <button 
                onClick={handleScrollToProducts}
                className="px-8 py-3 bg-black text-white font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Explore Collection
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* HERO TEXT: Morphing Heading */}
        <motion.h1 
          className="fixed text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] font-bold tracking-tighter uppercase text-primary-background drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-10 origin-top-left whitespace-nowrap pointer-events-none"
          style={{ top, left, x, y, scale, opacity: heroOpacity }}
        >
          RAKARITUALS
        </motion.h1>

        <motion.div
          style={{ 
            x: useTransform(bsX, v => `${v}%`),
            opacity: bsFadeOut
          }}
          className="absolute inset-0 z-30 flex items-end justify-center pb-12 pointer-events-none px-6 md:px-20"
        >
            <motion.div 
              style={{ opacity: bsOpacity }}
              className="section-layer w-full max-w-[1020px] pointer-events-auto bg-[#e8e1d9] rounded-[24px] p-8 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-white/20 overflow-hidden"
            >
              <motion.div style={{ x: bsTitleX }} className="mb-8">
                <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-[#1a1a1a]">
                  BEST SELLERS
                </h2>
              </motion.div>

              <motion.div 
                style={{ x: bsCardsX }}
                ref={scrollTrackRef}
                className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar scroll-smooth"
              >
                {error ? (
                  <p className="text-[#2b2622] font-semibold py-10">Failed to load best sellers</p>
                ) : !bestSellers ? (
                  <p className="text-[#2b2622] font-semibold animate-pulse py-10">Loading...</p>
                ) : (
                  bestSellers.map((product, index) => (
                    <div key={product._id || product.id || `best-seller-${index}`} className="flex-shrink-0 w-[240px] md:w-[260px]">
                      <ProductCard product={product} />
                    </div>
                  ))
                )}
              </motion.div>
            </motion.div>
          </motion.div>
      </div>
    </motion.section>
  );
}
