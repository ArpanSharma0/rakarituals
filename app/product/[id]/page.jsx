"use client";

import { useEffect, useState } from "react";
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
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 border-t border-[#dcd4cb]/50 mt-8">
    {[
      { id: "secure", icon: "🛡️", title: "Secure Ritual", desc: "PCI Certified" },
      { id: "swift", icon: "🚚", title: "Swift Dispatch", desc: "48h Handled" },
      { id: "pure", icon: "✨", title: "Pure Quality", desc: "Ritual Grade" },
    ].map((item) => (
      <div key={item.id} className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center text-lg opacity-80">
          <span>{item.icon}</span>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#2b2622]">{item.title}</p>
          <p className="text-[8px] font-medium text-[#6f6a65]/60 uppercase tracking-widest">{item.desc}</p>
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
  const [activeImage, setActiveImage] = useState(0);

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
      
      <main className="pt-32 pb-40 px-6 sm:px-12">
        <div className="max-w-[1240px] mx-auto">
          {/* Main Symmetrical Grid based on Wireframe Proportions */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_450px] gap-16 items-start">
            
            {/* Gallery Unit (Wireframe "Frame" - Thumbnails + Hero) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex flex-row gap-8 items-start"
            >
              {/* Vertical Thumbnails (Inside the Gallery Unit) */}
              <div className="hidden lg:flex flex-col gap-3 w-20 sticky top-40">
                {(product.images && product.images.length > 0 ? product.images : [product.image]).map((img, idx) => (
                  <motion.div 
                    key={`thumb-desktop-${idx}`} 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-3xl border-2 transition-all cursor-pointer overflow-hidden p-2 bg-white flex items-center justify-center ${
                      activeImage === idx ? "border-[#2b2622] shadow-xl ring-2 ring-[#2b2622]/5" : "border-[#dcd4cb]/10 opacity-30 hover:opacity-80"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </motion.div>
                ))}
              </div>

              {/* Main Product Hero (Centered in Frame) */}
              <div className="flex-1 bg-white/30 rounded-[60px] p-12 border border-[#dcd4cb]/30 shadow-inner group relative h-[500px] lg:h-[700px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImage}
                    initial={{ opacity: 0, scale: 0.85, filter: "blur(15px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.15, filter: "blur(15px)" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    layoutId={activeImage === 0 ? `product-image-${product._id}` : undefined}
                    src={product.images && product.images.length > 0 ? product.images[activeImage] : product.image} 
                    alt={product.name}
                    className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(43,38,34,0.15)]"
                  />
                </AnimatePresence>

                {/* Mobile Thumbnails (Horizontal Bottom) */}
                <div className="absolute bottom-6 left-0 right-0 flex lg:hidden justify-center gap-3 px-4">
                  {(product.images && product.images.length > 0 ? product.images : [product.image]).map((img, idx) => (
                    <div 
                      key={`thumb-mobile-${idx}`} 
                      onClick={() => setActiveImage(idx)}
                      className={`shrink-0 w-14 h-14 rounded-2xl border transition-all p-1.5 bg-white shadow-lg ${
                        activeImage === idx ? "border-[#2b2622] scale-110" : "border-[#dcd4cb]/30 opacity-60"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Information Panel (Strict Box-based UI) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="lg:sticky lg:top-40 flex flex-col gap-5"
            >
              {/* BOX 1: Title & Main Category (Full Width) */}
              <div className="bg-white border border-[#dcd4cb]/50 rounded-[40px] p-10 shadow-sm space-y-4">
                <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#6f6a65]/50">
                  <button onClick={() => router.push("/")} className="hover:text-[#2b2622] transition-colors">Temple Collection</button>
                  <span className="opacity-10">•</span>
                  <span className="text-[#b89b5e]">{product.category || "Ritual Piece"}</span>
                </nav>
                <h1 className="text-6xl lg:text-7xl font-bold tracking-tighter text-[#2b2622] leading-[0.9]">
                  {product.name}
                </h1>
              </div>

              {/* BOX 2: Essential Value & Story (Medium Focus Box) */}
              <div className="bg-white/60 backdrop-blur-xl border border-[#dcd4cb]/40 rounded-[40px] p-8 space-y-6">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6f6a65]/60">Sacred Contribution</span>
                    <p className="text-5xl font-bold text-[#2b2622] tracking-tighter font-serif">₹{product.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6f6a65]/40 block mb-1">Estimated Dispatch</span>
                    <p className="text-[10px] font-bold text-[#2b2622]/60">Within 48 Temple Hours</p>
                  </div>
                </div>
                <p className="text-[#6f6a65] text-[15px] leading-relaxed font-light italic opacity-80 border-t border-[#dcd4cb]/30 pt-6">
                  "{product.description}"
                </p>
              </div>

              {/* INTERACTION ROW: BOX 3 & BOX 4 (Symmetrical Half Boxes) */}
              <div className="grid grid-cols-2 gap-5">
                {/* BOX 3: Quantity */}
                <div className="bg-white border border-[#dcd4cb]/60 rounded-[32px] p-6 flex flex-col items-center gap-3 group hover:border-[#2b2622]/20 transition-colors">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6f6a65]/60">Divine Count</span>
                  <div className="flex items-center justify-between w-full px-2">
                    <button 
                      onClick={() => adjustQuantity(-1)}
                      className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#f7f6f1] text-[#2b2622] transition-transform hover:scale-110 active:scale-90 disabled:opacity-20"
                      disabled={quantity <= 1}
                    >
                      <span className="text-xl">−</span>
                    </button>
                    <span className="font-bold text-[#2b2622] text-2xl font-mono">{quantity}</span>
                    <button 
                      onClick={() => adjustQuantity(1)}
                      className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#f7f6f1] text-[#2b2622] transition-transform hover:scale-110 active:scale-90 disabled:opacity-20"
                      disabled={quantity >= product.countInStock}
                    >
                      <span className="text-xl">+</span>
                    </button>
                  </div>
                </div>

                {/* BOX 4: Ritual Availability */}
                <div className="bg-[#2b2622] rounded-[32px] p-6 flex flex-col items-center justify-center gap-2 text-center shadow-xl">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Temple Status</span>
                  <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                    product.countInStock > 0 
                    ? 'text-[#b89b5e] border-[#b89b5e]/20 bg-[#b89b5e]/5' 
                    : 'text-rose-400 border-rose-400/20 bg-rose-400/5'
                  }`}>
                    {product.countInStock > 0 ? "Ritual Ready" : "Departed"}
                  </div>
                </div>
              </div>

              {/* BOX 5: Main Ritual CTA (Full Width) */}
              <div className="relative group">
                <div className="absolute inset-0 bg-[#b89b5e]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <button 
                  onClick={handleAddToCart}
                  disabled={adding || product.countInStock <= 0}
                  className={`relative w-full py-8 rounded-[40px] font-black uppercase tracking-[0.5em] text-[12px] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 overflow-hidden ${
                    success ? 'bg-emerald-600' : 'bg-[#2b2622] text-white hover:shadow-[0_20px_40px_rgba(43,38,34,0.3)]'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {adding ? (
                      <motion.span 
                        key="adding"
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                        className="flex items-center justify-center gap-4"
                      >
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Invoking...
                      </motion.span>
                    ) : success ? (
                      <motion.span 
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-3"
                      >
                        Ritual Prepared ✨
                      </motion.span>
                    ) : (
                      <motion.span 
                        key="default"
                        className="flex items-center justify-center gap-3"
                      >
                        Begin the Ritual
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              {/* Integrated Trust Element Footer */}
              <div className="mt-4 opacity-60 hover:opacity-100 transition-opacity">
                <TrustElements />
              </div>
            </motion.div>
          </div>

          {/* BELOW THE FOLD: Narrative Section */}
          <div className="mt-40 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <span className="text-[#b89b5e] font-black uppercase tracking-[0.5em] text-[11px] block">Manifestation & Narrative</span>
                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-[#2b2622] leading-none">The Essence of {product.name}</h2>
                <p className="text-xl text-[#6f6a65] font-light leading-relaxed max-w-3xl italic">
                  Crafted by master artisans within the Rakarituals Collective, this limited piece serves as a vessel for focused intention. It is not merely an object, but a milestone in your spiritual architecture.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-[#dcd4cb] pt-12">
                <div className="space-y-4">
                  <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-[#2b2622]">Maintenance Ceremony</h4>
                  <p className="text-base text-[#6f6a65] font-light leading-relaxed opacity-80">
                    Handle only with cleansed hands. To preserve the sacred integrity, ensure the object stays within its designated sanctuary space, away from active currents.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-black uppercase tracking-[0.3em] text-[10px] text-[#2b2622]">Vessel Specifications</h4>
                  <ul className="text-[12px] space-y-4 font-mono opacity-80 uppercase">
                    <li className="flex justify-between border-b border-[#dcd4cb]/40 pb-2"><span>Aura Grade</span><span className="font-bold text-[#b89b5e]">Ritual Elite</span></li>
                    <li className="flex justify-between border-b border-[#dcd4cb]/40 pb-2"><span>Harmonic Origin</span><span className="font-bold">Sacred Valley</span></li>
                    <li className="flex justify-between border-b border-[#dcd4cb]/40 pb-2"><span>Weight Class</span><span className="font-bold">Harmonious</span></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#b89b5e]/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative aspect-[4/5] rounded-[60px] overflow-hidden shadow-[0_40px_80px_rgba(43,38,34,0.12)]">
                <img 
                  src={product.images && product.images.length > 0 ? product.images[0] : product.image} 
                  className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center p-12 text-center text-white backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity duration-700">
                  <p className="italic text-2xl font-serif leading-relaxed line-clamp-4">"True luxury is found in the silence between intentions."</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-40 pt-24 border-t-2 border-[#2b2622]/5"
            >
              <div className="flex items-center justify-between mb-16 px-4">
                <div className="space-y-4">
                  <span className="text-[#b89b5e] font-black uppercase tracking-[0.5em] text-[11px]">The Flow Continues</span>
                  <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-[#2b2622]">Resonant Pieces</h2>
                </div>
                <button 
                  onClick={() => router.push("/")}
                  className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#2b2622] group"
                >
                  <span className="border-b-2 border-[#2b2622] pb-1 group-hover:text-[#b89b5e] group-hover:border-[#b89b5e] transition-colors">Temple Catalog</span>
                  <span className="text-xl transition-transform group-hover:translate-x-2">→</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
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
