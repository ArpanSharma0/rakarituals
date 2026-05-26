"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchProducts } from "@/utils/api";
import ProductCard from "@/components/ProductCard";
import { useSocket } from "@/context/SocketContext";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export default function AllProducts() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    const getProducts = async () => {
      const data = await fetchProducts();
      if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setError(true);
      }
    };
    getProducts();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleProductCreated = (newProduct) => {
      setProducts((prevProducts) => {
        if (!prevProducts) return prevProducts;
        if (prevProducts.some((p) => p._id === newProduct._id)) return prevProducts;
        return [...prevProducts, newProduct];
      });
    };

    const handleProductUpdated = (updatedProduct) => {
      setProducts((prevProducts) => {
        if (!prevProducts) return prevProducts;
        return prevProducts.map((p) => (p._id === updatedProduct._id ? updatedProduct : p));
      });
    };

    const handleProductDeleted = (deletedProductId) => {
      setProducts((prevProducts) => {
        if (!prevProducts) return prevProducts;
        return prevProducts.filter((p) => p._id !== deletedProductId);
      });
    };

    socket.on("productCreated", handleProductCreated);
    socket.on("productUpdated", handleProductUpdated);
    socket.on("productDeleted", handleProductDeleted);

    return () => {
      socket.off("productCreated", handleProductCreated);
      socket.off("productUpdated", handleProductUpdated);
      socket.off("productDeleted", handleProductDeleted);
    };
  }, [socket]);

  if (error) {
    return (
      <section className="w-full bg-[#f7f6f1] py-24 text-center">
        <p className="text-[#2b2622] font-semibold">Failed to load products</p>
      </section>
    );
  }

  if (!products) {
    return (
      <section className="w-full bg-[#f7f6f1] py-24 text-center">
        <p className="text-[#2b2622] font-semibold animate-pulse">Loading...</p>
      </section>
    );
  }

  // Calculate the first line count based on screen layout:
  // - lg (Large screens): 4 columns
  // - md (Medium screens): 3 columns
  // - sm/xs (Mobile): 2 columns
  // We'll show 4 by default for the first row.
  const initialShowCount = 4;
  const visibleProducts = isExpanded ? products : products.slice(0, initialShowCount);
  const showViewAllButton = products.length > initialShowCount && !isExpanded;

  return (
    <section id="all-products" className="ritual-section bg-[#f7f6f1] section-layer">
      <div className="ritual-container">

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <p className="text-[#b89b5e] text-xs uppercase tracking-[0.3em] mb-4 font-bold">Collection</p>
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-[#2b2622]">
            All Products
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
          {visibleProducts.map((product, index) => (
            <motion.div
              key={product.id || index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              variants={fadeInUp}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {showViewAllButton && (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            variants={fadeInUp}
            className="text-center mt-16"
          >
            <button 
              onClick={() => setIsExpanded(true)}
              className="btn-primary py-4 px-12 shadow-premium cursor-pointer"
            >
              View All
            </button>
          </motion.div>
        )}

      </div>
    </section>
  );
}
