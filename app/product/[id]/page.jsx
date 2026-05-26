"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProductById, fetchBestSellers, createProductReview } from "@/utils/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
import ProductCard from "@/components/ProductCard";
import { useSocket } from "@/context/SocketContext";

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
  <div className="min-h-screen bg-[#f7f6f1] pt-4 pb-20 px-6 sm:px-12 lg:px-24 animate-pulse">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
      <div className="w-full lg:w-1/2 aspect-square rounded-2xl lg:rounded-[40px] bg-[#e8e1d9]"></div>
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

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { toggleWishlist, wishlistItems } = useWishlist();
  const isInWishlist = wishlistItems.some((item) => (item._id || item.id) === (product?._id || product?.id));

  const handleWishlistToggle = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (product) {
      toggleWishlist(product._id || product.id);
    }
  };

  const reloadProduct = async () => {
    try {
      const productData = await fetchProductById(id);
      setProduct(productData);
    } catch (err) {
      console.error("Error reloading product details:", err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);
    setSubmittingReview(true);
    try {
      await createProductReview(product._id || product.id, { rating: reviewRating, comment: reviewComment });
      setReviewSuccess(true);
      setReviewComment("");
      setReviewRating(5);
      await reloadProduct();
    } catch (err) {
      setReviewError(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= roundedRating ? "text-[#FB9E5B]" : "text-[#e9e9e9]"}>
          ★
        </span>
      );
    }
    return stars;
  };

  const scrollRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const images = product?.images && product.images.length > 0 ? product.images : (product ? [product.image] : []);

  const handleScroll = (e) => {
    if (isScrollingRef.current) return;
    const container = e.target;
    const width = container.offsetWidth;
    if (width <= 0) return;
    const scrollLeft = container.scrollLeft;
    const index = Math.round(scrollLeft / width);
    if (index !== activeImage && index >= 0 && index < images.length) {
      setActiveImage(index);
    }
  };

  const handleNextImage = () => {
    if (images.length <= 1) return;
    const nextIdx = (activeImage + 1) % images.length;
    setActiveImage(nextIdx);
  };

  const handlePrevImage = () => {
    if (images.length <= 1) return;
    const prevIdx = (activeImage - 1 + images.length) % images.length;
    setActiveImage(prevIdx);
  };

  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const targetLeft = activeImage * container.offsetWidth;
      if (Math.abs(container.scrollLeft - targetLeft) > 10) {
        isScrollingRef.current = true;
        container.scrollTo({
          left: targetLeft,
          behavior: 'smooth',
        });
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      }
    }
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [activeImage]);

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

  const socket = useSocket();

  useEffect(() => {
    if (!socket || !id) return;

    const refreshRelated = async () => {
      try {
        const bestSellers = await fetchBestSellers();
        setRelatedProducts(bestSellers.filter(p => p._id !== id).slice(0, 4));
      } catch (err) {
        console.error("Error refreshing related products:", err);
      }
    };

    const handleProductUpdated = (updatedProduct) => {
      // Check if this matches current product ID
      if (updatedProduct._id === id) {
        setProduct(updatedProduct);
      }
      
      // Check if it affects related products list (bestseller flag changed)
      setRelatedProducts((prevRelated) => {
        const existingProduct = prevRelated.find((p) => p._id === updatedProduct._id);
        const flagChanged = existingProduct 
          ? existingProduct.isBestSeller !== updatedProduct.isBestSeller 
          : updatedProduct.isBestSeller;

        if (flagChanged) {
          refreshRelated();
          return prevRelated;
        }

        return prevRelated.map((p) => (p._id === updatedProduct._id ? updatedProduct : p));
      });
    };

    const handleProductDeleted = (deletedProductId) => {
      // If the current product was deleted, set error
      if (deletedProductId === id) {
        setError("This product is no longer available in the temple catalog.");
      }
      
      // Filter out of related products and refresh to fill empty slots
      setRelatedProducts((prevRelated) => {
        const exists = prevRelated.some((p) => p._id === deletedProductId);
        if (exists) {
          refreshRelated();
        }
        return prevRelated.filter((p) => p._id !== deletedProductId);
      });
    };

    const handleProductCreated = (newProduct) => {
      if (newProduct.isBestSeller && newProduct._id !== id) {
        refreshRelated();
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
  }, [socket, id]);

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
    <div className="bg-[var(--bg-primary)] min-h-screen selection:bg-[var(--accent)]/20">
      <Navbar />
      
      <main className="pt-28 pb-40 px-6 sm:px-12">
        <div className="max-w-[1240px] mx-auto">
          {/* Main 2-Column Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_clamp(360px,42%,460px)] gap-12 lg:gap-16 items-start">
            
            {/* Gallery Unit */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              {/* Mobile view: Native Snap Scroll Row (Amazon-style) */}
              <div 
                className="lg:hidden bg-white rounded-sm p-4 border border-[#e9e9e9] relative h-[400px] flex items-center justify-center overflow-hidden"
              >
                <div 
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
                >
                  {images.map((img, idx) => (
                    <div 
                      key={`mobile-image-${idx}`}
                      className="w-full h-full shrink-0 snap-center flex items-center justify-center"
                    >
                      <img 
                        src={img} 
                        alt={product.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>

                {/* Mobile Pagination Dots (Amazon-style) */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                    {images.map((_, idx) => (
                      <button
                        key={`dot-${idx}`}
                        onClick={() => setActiveImage(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          activeImage === idx ? "bg-[#151515] scale-125" : "bg-[#151515]/20"
                        }`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop view: Flat Grid Layout of all images */}
              <div className="hidden lg:grid grid-cols-2 gap-2">
                {images.map((img, idx) => (
                  <div 
                    key={`desktop-image-${idx}`}
                    className={`bg-white border border-[#e9e9e9] p-4 flex items-center justify-center h-[350px] overflow-hidden rounded-sm ${
                      images.length === 1 ? "col-span-2 h-[550px]" : ""
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} - view ${idx + 1}`} 
                      className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Information Panel */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="lg:sticky lg:top-28 flex flex-col"
            >
              {/* Category / Vendor */}
              <div className="text-[10px] uppercase font-bold tracking-[0.25em] text-[var(--accent)] mb-2 font-body">
                Temple Collection • {product.category || "Ritual Piece"}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-tight text-[var(--text-heading)] mb-3 font-heading leading-tight">
                {product.name}
              </h1>

              {/* Price Container */}
              <div className="mb-4 pb-4 border-b border-[#e9e9e9]">
                <p className="text-2xl font-bold text-[var(--text-heading)] tracking-tighter font-serif">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-[var(--text-body)] opacity-70 mt-1">
                  Tax included. Shipping calculated at checkout.
                </p>
              </div>

              {/* Ratings Stars link that scrolls to reviews section */}
              <a 
                href="#reviews-section" 
                className="flex items-center gap-2 mb-6 cursor-pointer hover:opacity-85 transition-opacity"
              >
                <div className="flex text-sm text-[#FB9E5B]">
                  {renderStars(product.rating || 0)}
                </div>
                <span className="text-[10px] font-bold text-[var(--text-body)]">
                  {(product.rating || 0).toFixed(1)} ({product.numReviews || 0} review{product.numReviews !== 1 ? 's' : ''})
                </span>
              </a>

              {/* Interaction Form: Quantity & Action Buttons */}
              <div className="flex flex-col gap-4 mb-8">
                {/* Quantity Selector & Status */}
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-body)]">Quantity:</span>
                  <div className="flex items-center border border-[#e9e9e9] rounded-sm bg-white overflow-hidden h-10">
                    <button 
                      onClick={() => adjustQuantity(-1)}
                      className="w-10 h-full flex items-center justify-center text-[var(--text-heading)] hover:bg-[#e9e9e9]/35 transition-colors disabled:opacity-20"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-bold text-[var(--text-heading)] text-xs font-mono">{quantity}</span>
                    <button 
                      onClick={() => adjustQuantity(1)}
                      className="w-10 h-full flex items-center justify-center text-[var(--text-heading)] hover:bg-[#e9e9e9]/35 transition-colors disabled:opacity-20"
                      disabled={quantity >= product.countInStock}
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Availability Badge */}
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ml-auto ${
                    product.countInStock > 0 
                    ? 'text-[var(--accent)] border-[var(--accent)]/20 bg-[var(--accent)]/5' 
                    : 'text-red-400 border-red-400/20 bg-red-400/5'
                  }`}>
                    {product.countInStock > 0 ? "Ritual Ready" : "Departed"}
                  </span>
                </div>

                {/* Primary Checkout Actions */}
                <div className="flex gap-3">
                  <button 
                    onClick={handleAddToCart}
                    disabled={adding || product.countInStock <= 0}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-sm duration-300 ${
                      success 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-[#151515] text-white hover:bg-[var(--accent)]'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {adding ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Adding...
                        </span>
                      ) : success ? (
                        <span>Item Added ✨</span>
                      ) : (
                        <span>Add to Cart</span>
                      )}
                    </AnimatePresence>
                  </button>

                  <button
                    onClick={handleWishlistToggle}
                    className="w-12 h-12 shrink-0 border border-[#e9e9e9] rounded-sm bg-white hover:border-[#151515] flex items-center justify-center transition-all active:scale-95 group/wishlist cursor-pointer"
                    title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform group-hover/wishlist:scale-110 ${isInWishlist ? 'text-[var(--accent)] fill-[var(--accent)]' : 'text-[#6f6a65] fill-none'}`}
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs leading-relaxed text-[var(--text-body)] font-light italic mb-8 border-t border-[#e9e9e9] pt-6">
                "{product.description}"
              </div>

              {/* Accordions */}
              <div className="border-t border-[#e9e9e9] mt-4">
                <details className="group border-b border-[#e9e9e9] py-4 cursor-pointer">
                  <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[var(--text-heading)] select-none list-none [&::-webkit-details-marker]:hidden">
                    <span>The Essence &amp; Narrative</span>
                    <span className="relative w-3 h-3 flex items-center justify-center">
                      <span className="absolute w-3 h-[1.5px] bg-[var(--text-heading)]"></span>
                      <span className="absolute w-[1.5px] h-3 bg-[var(--text-heading)] transition-transform duration-300 group-open:rotate-90 group-open:opacity-0"></span>
                    </span>
                  </summary>
                  <div className="mt-4 text-xs leading-relaxed text-[var(--text-body)] font-light">
                    <p>
                      Crafted by master artisans within the Rakarituals Collective, this limited piece serves as a vessel for focused intention. It is not merely an object, but a milestone in your spiritual architecture.
                    </p>
                  </div>
                </details>

                <details className="group border-b border-[#e9e9e9] py-4 cursor-pointer">
                  <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[var(--text-heading)] select-none list-none [&::-webkit-details-marker]:hidden">
                    <span>Maintenance Ceremony</span>
                    <span className="relative w-3 h-3 flex items-center justify-center">
                      <span className="absolute w-3 h-[1.5px] bg-[var(--text-heading)]"></span>
                      <span className="absolute w-[1.5px] h-3 bg-[var(--text-heading)] transition-transform duration-300 group-open:rotate-90 group-open:opacity-0"></span>
                    </span>
                  </summary>
                  <div className="mt-4 text-xs leading-relaxed text-[var(--text-body)] font-light">
                    <p>
                      Handle only with cleansed hands. To preserve the sacred integrity, ensure the object stays within its designated sanctuary space, away from active currents.
                    </p>
                  </div>
                </details>

                <details className="group border-b border-[#e9e9e9] py-4 cursor-pointer">
                  <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[var(--text-heading)] select-none list-none [&::-webkit-details-marker]:hidden">
                    <span>Vessel Specifications</span>
                    <span className="relative w-3 h-3 flex items-center justify-center">
                      <span className="absolute w-3 h-[1.5px] bg-[var(--text-heading)]"></span>
                      <span className="absolute w-[1.5px] h-3 bg-[var(--text-heading)] transition-transform duration-300 group-open:rotate-90 group-open:opacity-0"></span>
                    </span>
                  </summary>
                  <div className="mt-4 text-xs leading-relaxed text-[var(--text-body)] font-light">
                    <ul className="space-y-2 font-mono uppercase text-[10px]">
                      <li className="flex justify-between border-b border-[#e9e9e9]/60 pb-1">
                        <span>Aura Grade</span>
                        <span className="font-bold text-[var(--accent)]">Ritual Elite</span>
                      </li>
                      <li className="flex justify-between border-b border-[#e9e9e9]/60 pb-1">
                        <span>Harmonic Origin</span>
                        <span className="font-bold">Sacred Valley</span>
                      </li>
                      <li className="flex justify-between pb-1">
                        <span>Weight Class</span>
                        <span className="font-bold">Harmonious</span>
                      </li>
                    </ul>
                  </div>
                </details>

                <details className="group border-b border-[#e9e9e9] py-4 cursor-pointer">
                  <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[var(--text-heading)] select-none list-none [&::-webkit-details-marker]:hidden">
                    <span>Trusted Experience</span>
                    <span className="relative w-3 h-3 flex items-center justify-center">
                      <span className="absolute w-3 h-[1.5px] bg-[var(--text-heading)]"></span>
                      <span className="absolute w-[1.5px] h-3 bg-[var(--text-heading)] transition-transform duration-300 group-open:rotate-90 group-open:opacity-0"></span>
                    </span>
                  </summary>
                  <div className="mt-4">
                    <TrustElements />
                  </div>
                </details>
              </div>
            </motion.div>
          </div>


          {/* Customer Reviews Section */}
          <div id="reviews-section" className="mt-24 pt-16 border-t border-[#e9e9e9]">
            <h3 className="text-xl font-bold uppercase tracking-wider text-[var(--text-heading)] mb-10 font-heading">
              Customer Reviews
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
              {/* Review summary stats */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-serif font-bold text-[var(--text-heading)]">
                    {(product.rating || 0).toFixed(1)}
                  </span>
                  <div>
                    <div className="flex text-base text-[#FB9E5B]">
                      {renderStars(product.rating || 0)}
                    </div>
                    <p className="text-xs text-[var(--text-body)] mt-1 font-body">
                      Based on {product.numReviews || 0} review{product.numReviews !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Rating breakdown */}
                <div className="space-y-2 pt-4 border-t border-[#e9e9e9]/50">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = (product.reviews || []).filter(r => Math.round(r.rating) === stars).length;
                    const total = (product.reviews || []).length;
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs text-[var(--text-body)]">
                        <span className="w-12">{stars} star</span>
                        <div className="flex-1 h-2 bg-[#e9e9e9] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#FB9E5B] rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="w-8 text-right">{percentage.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List & Write Form */}
              <div className="md:col-span-2 space-y-8">
                {(!product.reviews || product.reviews.length === 0) ? (
                  <div className="text-center py-10 bg-white border border-[#e9e9e9] rounded-sm p-6 text-[var(--text-body)]">
                    <p className="text-xs font-light">No reviews yet for this product.</p>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4">
                    {product.reviews.map((rev, idx) => (
                      <div key={rev._id || idx} className="border-b border-[#e9e9e9]/60 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider font-body">
                            {rev.name}
                          </h4>
                          <span className="text-[10px] text-[var(--text-body)] opacity-60">
                            {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex text-xs text-[#FB9E5B] mb-2">
                          {renderStars(rev.rating)}
                        </div>
                        <p className="text-xs text-[var(--text-body)] font-light leading-relaxed font-body">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit review block */}
                <div className="mt-8 pt-8 border-t border-[#e9e9e9]">
                  {user ? (
                    <div>
                      {reviewSuccess ? (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm p-4 text-xs font-medium">
                          Thank you! Your review has been submitted successfully. ✨
                        </div>
                      ) : (
                        <details className="group/review-form border border-[#e9e9e9] rounded-sm bg-white overflow-hidden">
                          <summary className="flex justify-between items-center px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-heading)] select-none list-none cursor-pointer hover:bg-neutral-50/50 [&::-webkit-details-marker]:hidden">
                            <span>Write a review</span>
                            <span className="relative w-3 h-3 flex items-center justify-center">
                              <span className="absolute w-3 h-[1.5px] bg-[var(--text-heading)]"></span>
                              <span className="absolute w-[1.5px] h-3 bg-[var(--text-heading)] transition-transform duration-300 group-open/review-form:rotate-90 group-open/review-form:opacity-0"></span>
                            </span>
                          </summary>
                          <div className="p-6 border-t border-[#e9e9e9] space-y-4">
                            {reviewError && (
                              <div className="bg-red-50 border border-red-200 text-red-800 rounded-sm p-4 text-xs">
                                {reviewError}
                              </div>
                            )}
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                              <div className="space-y-2">
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-body)]">
                                  Rating:
                                </label>
                                <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map((stars) => (
                                    <button
                                      key={stars}
                                      type="button"
                                      onClick={() => setReviewRating(stars)}
                                      className="text-2xl hover:scale-110 transition-transform focus:outline-none"
                                    >
                                      <span className={stars <= reviewRating ? "text-[#FB9E5B]" : "text-[#e9e9e9]"}>
                                        ★
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <label htmlFor="review-comment" className="block text-[10px] uppercase font-bold tracking-wider text-[var(--text-body)]">
                                  Review Comment:
                                </label>
                                <textarea
                                  id="review-comment"
                                  rows={4}
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  placeholder="Share your experience with this ritual piece..."
                                  required
                                  className="w-full text-xs p-3 border border-[#e9e9e9] rounded-sm focus:outline-none focus:border-[var(--accent)] font-body bg-white text-[var(--text-heading)]"
                                ></textarea>
                              </div>

                              <button
                                type="submit"
                                disabled={submittingReview}
                                className="bg-[#151515] text-white hover:bg-[var(--accent)] transition-all font-bold uppercase tracking-widest text-[10px] py-3.5 px-8 rounded-sm disabled:opacity-50"
                              >
                                {submittingReview ? "Submitting..." : "Submit Review"}
                              </button>
                            </form>
                          </div>
                        </details>
                      )}
                    </div>
                  ) : (
                    <div className="bg-neutral-50 border border-[#e9e9e9] rounded-sm p-6 text-center">
                      <p className="text-xs text-[var(--text-body)] mb-4">
                        Only verified members of the temple can submit a review.
                      </p>
                      <button
                        onClick={() => router.push(`/login?redirect=/product/${id}`)}
                        className="bg-[#151515] text-white hover:bg-[var(--accent)] px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest rounded-sm"
                      >
                        Sign In to Review
                      </button>
                    </div>
                  )}
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
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-12">
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
