"use client";

import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, useScroll, useTransform } from "framer-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function HeroSequence() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const scrollTrackRef = useRef(null);
  const frameCount = 160;

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

  // === BEST SELLERS: Slide in from LEFT to CENTER (pure horizontal) ===
  const bsX = useTransform(scrollYProgress, [0.4, 0.55], [-110, 0]); // percentage-based slide
  const bsOpacity = useTransform(scrollYProgress, [0.4, 0.55], [0, 1]);
  // Fade out best sellers before canvas fades out
  const bsFadeOut = useTransform(scrollYProgress, [0.7, 0.8], [1, 0]);
  
  // Micro Parallax for Background
  const bgParallax = useTransform(scrollYProgress, [0, 1], [0, -60]);

  useEffect(() => {
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
      const img = imagesRef.current[frameIndex];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      
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

      // Cover logic (preserve aspect ratio)
      const rx = canvas.width / img.naturalWidth;
      const ry = canvas.height / img.naturalHeight;
      const ratio = Math.max(rx, ry); 
      
      const drawWidth = img.naturalWidth * ratio;
      const drawHeight = img.naturalHeight * ratio;
      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2;
      
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, x, y, drawWidth, drawHeight);
      renderRequested = false;
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
      end: "bottom bottom",
      scrub: 1.5,
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
              <button className="px-8 py-3 bg-black text-white font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors">
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

        {/* === BEST SELLERS OVERLAY (Left-aligned, Glassmorphism, slides in from left) === */}
        <motion.div
          style={{ 
            x: useTransform(bsX, v => `${v}%`),
            opacity: bsFadeOut,
            marginLeft: "80px",
            marginRight: "80px"
          }}
          className="absolute inset-0 z-30 flex items-end pb-12 pointer-events-none"
        >
            <motion.div 
              style={{ opacity: bsOpacity }}
              whileHover={{ backgroundColor: "rgba(232, 225, 217, 1)" }}
              transition={{ duration: 0.3 }}
              className="section-layer w-[75vw] max-w-[960px] pointer-events-auto bg-[#e8e1d9] backdrop-blur-3xl rounded-[16px] p-5 md:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/30"
            >
              <h2 className="text-xl md:text-3xl font-bold uppercase tracking-tight mb-5 text-[#2b2622]">
                Best Sellers
              </h2>

              {/* Horizontally scrollable product cards — scroll hijacked when cursor is here */}
              <div 
                ref={scrollTrackRef}
                className="overflow-x-auto pb-3 scroll-smooth"
                style={{ 
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.3) transparent"
                }}
              >
                <div className="flex gap-4" style={{ width: "max-content" }}>
                  {[
                    { id: 1, name: "Sacred Incense Set", price: "$45.00", desc: "Purify your space" },
                    { id: 2, name: "Meditation Stones", price: "$38.00", desc: "Ground your energy" },
                    { id: 3, name: "Ritual Candle Trio", price: "$52.00", desc: "Illuminate your path" },
                    { id: 4, name: "Crystal Bowl", price: "$89.00", desc: "Harmonize mind & body" },
                    { id: 5, name: "Herbal Smudge Kit", price: "$34.00", desc: "Renew your aura" },
                    { id: 6, name: "Zen Garden Set", price: "$67.00", desc: "Find inner peace" },
                  ].map((product) => (
                    <div 
                      key={product.id} 
                      className="flex-shrink-0 w-[200px] md:w-[220px] bg-[#f7f6f1] rounded-2xl p-4 border border-black/[0.03] shadow-sm flex flex-col cursor-pointer transition-all duration-350 ease-out hover:-translate-y-2 hover:shadow-md"
                    >
                      <div className="w-full h-36 bg-black/[0.04] rounded-xl mb-3 overflow-hidden">
                        <div className="w-full h-full transition-transform duration-400 hover:scale-105"></div>
                      </div>
                      <h3 className="text-sm font-semibold mb-0.5 uppercase tracking-wide text-[#2b2622]">{product.name}</h3>
                      <p className="text-[#6f6a65] text-xs mb-2">{product.desc}</p>
                      <div className="flex justify-between items-center mt-auto">
                        <span className="font-bold text-[#2b2622] text-sm">{product.price}</span>
                        <button className="px-2.5 py-1 bg-black text-white text-[10px] uppercase tracking-widest rounded-md hover:bg-neutral-800 transition-colors duration-300">
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </motion.div>

        </div>
      </motion.section>
    );
}
