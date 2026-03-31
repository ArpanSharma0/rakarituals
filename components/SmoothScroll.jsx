"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Dynamically import locomotive-scroll to avoid SSR issues
// eslint-disable-next-line react/prop-types
const SmoothScroll = ({ children }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    let locoScroll = null;

    import("locomotive-scroll").then((LocomotiveScroll) => {
      // Register GSAP plugins
      gsap.registerPlugin(ScrollTrigger);

      const Scroll = LocomotiveScroll.default || LocomotiveScroll;

      locoScroll = new Scroll({
        el: scrollRef.current,
        smooth: true,
        lerp: 0.1, // Optimized for responsiveness
        multiplier: 1,
        touchMultiplier: 2,
        getDirection: true,
      });

      // Synchronize ScrollTrigger with Locomotive Scroll
      locoScroll.on("scroll", ScrollTrigger.update);

      ScrollTrigger.scrollerProxy(scrollRef.current, {
        scrollTop(value) {
          if (arguments.length) {
            locoScroll.scrollTo(value, { duration: 0, disableLerp: true });
            return;
          }
          return locoScroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType: scrollRef.current.style.transform ? "transform" : "fixed",
      });

      // Refresh ScrollTrigger when Locomotive Scroll updates
      ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
      ScrollTrigger.refresh();

      // Final update after a short delay for content loading
      setTimeout(() => {
        locoScroll.update();
        ScrollTrigger.refresh();
      }, 500);
    });

    return () => {
      if (locoScroll) {
        locoScroll.destroy();
        locoScroll = null;
      }
      ScrollTrigger.removeEventListener("refresh", () => {});
    };
  }, []);

  return (
    <div 
      id="scroll-container" 
      data-scroll-container 
      ref={scrollRef}
      className="min-h-screen"
    >
      {children}
    </div>
  );
};

export default SmoothScroll;
