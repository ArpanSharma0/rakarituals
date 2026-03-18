"use client";

import React from "react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export default function OurMission() {
  return (
    <section id="about" className="w-full bg-[#f7f6f1] py-28 px-6 md:px-20">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          variants={fadeInUp}
        >
          <p className="text-[#b89b5e] text-xs uppercase tracking-[0.3em] mb-5 font-bold">Our Mission</p>
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-10 text-[#2b2622]">
            Rooted in Stillness
          </h2>
          <p className="text-[#6f6a65] text-base md:text-lg leading-[1.8] max-w-2xl mx-auto">
            At Rakarituals, we believe that true growth begins in moments of calm. 
            Our products are crafted to support meditation, mindfulness, and the 
            sacred rituals that bring meaning to everyday life. Each item is chosen 
            with care — to help you slow down, reconnect, and nurture your inner world.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
