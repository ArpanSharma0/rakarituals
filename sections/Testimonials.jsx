"use client";

import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    text: "Rakarituals has completely transformed my morning routine. The incense set creates the most peaceful atmosphere for meditation.",
  },
  {
    id: 2,
    name: "Arjun Mehta",
    text: "The quality of these products is unmatched. Every item feels intentional and sacred. I keep coming back for more.",
  },
  {
    id: 3,
    name: "Maya Kapoor",
    text: "I gifted the Crystal Singing Bowl to my mother and she loved it. Beautiful craftsmanship and deeply calming sound.",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export default function Testimonials() {
  return (
    <section className="w-full bg-[#f7f6f1] py-24 px-6 md:px-20">
      <div className="max-w-6xl mx-auto">

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <p className="text-[#b89b5e] text-xs uppercase tracking-[0.3em] mb-4 font-bold">Testimonials</p>
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-[#2b2622]">
            What Our Community Says
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              variants={fadeInUp}
              className="bg-[#e8e1d9] rounded-2xl p-8 shadow-[0_8px_25px_rgba(0,0,0,0.05)] border border-white/10 hover:shadow-lg transition-all duration-300"
            >
              <p className="text-[#6f6a65] text-sm md:text-base leading-relaxed mb-8 italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2b2622]/10 flex items-center justify-center text-[#2b2622]/40 font-bold text-xs">
                  {testimonial.name.charAt(0)}
                </div>
                <span className="text-sm font-bold uppercase tracking-wide text-[#2b2622]">{testimonial.name}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
