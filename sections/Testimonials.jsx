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
    <section className="w-full bg-[#FBF6F6] py-24 px-6 md:px-20">
      <div className="max-w-6xl mx-auto">

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-black/40 mb-4 font-medium">Testimonials</p>
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-black/90">
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
              className="bg-white rounded-xl p-8 border border-black/[0.04] hover:shadow-md transition-shadow duration-300"
            >
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8 italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-black/10 to-black/5"></div>
                <span className="text-sm font-semibold uppercase tracking-wide text-gray-800">{testimonial.name}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
