"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProductById, fetchBestSellers } from "@/utils/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import ProductCard from "@/components/ProductCard";

// Trust Elements Component
const TrustElements = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8 border-t border-[#dcd4cb] mt-12">
    {[
      { icon: "🛡️", title: "Secure Checkout", desc: "PCI Compliant" },
      { icon: "🚚", title: "Fast Delivery", desc: "48h Dispatch" },
      { icon: "✨", title: "Premium Quality", desc: "Ritual Grade" },
    ].map((item, idx) => (
      <div key={idx} className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#dcd4cb] group-hover:scale-110 transition-transform">
          <span className="text-lg">{item.icon}</span>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#2b2622]">{item.title}</p>
          <p className="text-[9px] font-medium text-[#6f6a65] uppercase tracking-wider">{item.desc}</p>
        </div>
      </div>
    ))}
  </div>
);

// Loading Skeleton Component
const Skeleton = () => (
  <div className="min-h-screen bg-[#f7f6f1] pt-32 pb-20 px-6 sm:px-12 lg:px-24 animate-pulse">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
      <div className="w-full lg:w-1/2 aspect-square rounded-[40px] bg-[#e8e1d9]"></div>
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        <div className="h-4 w-24 bg-[#e8e1d9] rounded"></div>
        <div className="h-16 w-full bg-[#e8e1d9] rounded"></div>
        <div className="h-10 w-32 bg-[#e8e1d9] rounded"></div>
        <div className="h-32 w-full bg-[#e8e1d9] rounded"></div>
        <div className="h-14 w-full bg-[#e8e1d9] rounded"></div>
      </div>
    </div>
  </div>
);

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productData, bestSellers] = await Promise.all([
          fetchProductById(id),
          fetchBestSellers()
        ]);
        setProduct(productData);
        setRelatedProducts(bestSellers.filter(p => p._id !== id).slice(0, 4));
      } catch (err) {
        setError(err.message || "Product not found");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setAdding(true);
    try {
      await addToCart(product._id, quantity);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const adjustQuantity = (amount) => {
    setQuantity(prev => Math.max(1, Math.min(prev + amount, product?.countInStock || 10)));
  };

  if (loading) return <><Navbar /><Skeleton /><Footer /></>;

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f7f6f1] flex flex-col items-center justify-center p-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-[#2b2622] mb-4">Ritual Not Found</h1>
          <p className="text-[#6f6a65] mb-8 max-w-md">The sacred item you seek is not currently in our temple catalog.</p>
          <button 
            onClick={() => router.push("/")}
            className="bg-[#2b2622] text-white px-10 py-4 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#b89b5e] transition-all shadow-xl hover:-translate-y-1"
          >
            Return to Temple
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f6f1] min-h-screen selection:bg-[#b89b5e]/20">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 sm:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          {/* Main Product Layout */}
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
            
            {/* Left: Enhanced Product Image */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full lg:w-[55%] sticky top-32"
            >
              <div className="relative aspect-[4/5] rounded-[48px] overflow-hidden bg-white shadow-[0_32px_64px_-16px_rgba(43,38,34,0.1)] border border-[#dcd4cb] group">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2b2622]/10 to-transparent pointer-events-none"></div>
                
                {/* Image Overlay Label */}
                <div className="absolute top-8 left-8">
                  <span className="bg-white/90 backdrop-blur-md px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-[#2b2622] shadow-sm border border-[#dcd4cb]">
                    {product.category || "Limited Edition"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right: Product Info */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="w-full lg:w-[45%] flex flex-col pt-4"
            >
              <div className="mb-10">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-[#2b2622] leading-[0.9] mb-8">
                  {product.name}
                </h1>
                
                <div className="flex items-end gap-5 mb-8">
                  <span className="text-4xl font-bold text-[#2b2622] tracking-tighter">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <div className={`mb-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
                    product.countInStock > 0 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    {product.countInStock > 0 ? "• In Stock" : "• Out of Stock"}
                  </div>
                </div>

                <p className="text-[#6f6a65] text-lg leading-relaxed italic border-l-2 border-[#b89b5e]/30 pl-6 py-2">
                  "{product.description}"
                </p>
              </div>

              {/* Purchase Actions */}
              <div className="bg-[#e8e1d9]/30 backdrop-blur-sm p-8 rounded-[32px] border border-[#dcd4cb] space-y-8">
                {/* Quantity Selector */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6f6a65] mb-4 block">Select Quantity</label>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-white rounded-2xl border border-[#dcd4cb] p-1.5 shadow-sm">
                      <button 
                        onClick={() => adjustQuantity(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#f7f6f1] text-[#2b2622] transition-colors disabled:opacity-30"
                        disabled={quantity <= 1}
                      >
                        <span className="text-xl">−</span>
                      </button>
                      <span className="w-12 text-center font-bold text-[#2b2622] text-lg">{quantity}</span>
                      <button 
                        onClick={() => adjustQuantity(1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#f7f6f1] text-[#2b2622] transition-colors disabled:opacity-30"
                        disabled={quantity >= product.countInStock}
                      >
                        <span className="text-xl">+</span>
                      </button>
                    </div>
                    <span className="text-[10px] font-bold text-[#6f6a65]/60 uppercase tracking-widest">
                      {product.countInStock} units available
                    </span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={adding || product.countInStock <= 0}
                    className={`relative w-full overflow-hidden py-6 rounded-2xl font-black uppercase tracking-[0.25em] text-[11px] shadow-[0_20px_40px_-12px_rgba(43,38,34,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group ${
                      success 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-[#2b2622] text-white hover:bg-[#b89b5e]'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {adding ? (
                        <motion.span 
                          key="adding"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center justify-center gap-3"
                        >
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Manifesting...
                        </motion.span>
                      ) : success ? (
                        <motion.span 
                          key="success"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center justify-center gap-2"
                        >
                          Added Successfully ✨
                        </motion.span>
                      ) : (
                        <motion.span 
                          key="default"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-center gap-3"
                        >
                          Add to Sacred Cart
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  
                  <p className="text-center text-[9px] font-bold text-[#6f6a65]/50 uppercase tracking-[0.2em]">
                    Free Shipping on orders above ₹999
                  </p>
                </div>
              </div>

              {/* Trust Elements */}
              <TrustElements />
            </motion.div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-32 pt-24 border-t border-[#dcd4cb]"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                  <span className="text-[#b89b5e] font-black uppercase tracking-[0.4em] text-[10px] block mb-4">Complete your flow</span>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#2b2622]">Other Top Picks</h2>
                </div>
                <button 
                  onClick={() => router.push("/")}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2b2622] hover:text-[#b89b5e] transition-colors pb-1 border-b-2 border-[#2b2622] hover:border-[#b89b5e]"
                >
                  View All Products
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((p, idx) => (
                  <motion.div 
                    key={p._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
