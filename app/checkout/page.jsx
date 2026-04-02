"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getUserProfile, updateUserProfile, placeOrder } from "@/utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { cartItems = [], refreshCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [savedAddress, setSavedAddress] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getUserProfile();
        if (profileData.address && profileData.address.addressLine) {
          setSavedAddress(profileData.address);
          setShippingAddress(profileData.address);
        } else {
          setUseSavedAddress(false);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setUseSavedAddress(false);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (!loading && cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartItems, loading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const isAddressValid = () => {
    return (
      shippingAddress.fullName &&
      shippingAddress.phone &&
      shippingAddress.addressLine &&
      shippingAddress.city &&
      shippingAddress.state &&
      shippingAddress.postalCode &&
      shippingAddress.country
    );
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isAddressValid()) {
      setMessage({ type: "error", text: "Please complete all address fields." });
      return;
    }

    setPlacingOrder(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. If it's a new address or modified, update user profile first (optional but good UX)
      if (!useSavedAddress || JSON.stringify(shippingAddress) !== JSON.stringify(savedAddress)) {
        await updateUserProfile({ address: shippingAddress });
      }

      // 2. Place the order with shippingAddress
      const subtotal = cartItems.reduce((acc, item) => {
        const price = typeof item.product.price === "string" 
          ? Number.parseFloat(item.product.price.replaceAll(/[^0-9.]/g, "")) 
          : Number(item.product.price);
        return acc + price * item.quantity;
      }, 0);

      await placeOrder({ 
        shippingAddress,
        items: cartItems,
        totalPrice: subtotal
      });

      // 3. Clear cart and redirect
      await refreshCart();
      router.push("/orders");
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to place order. Please try again." });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb]">
        <div className="w-12 h-12 border-4 border-[#b89b5e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((acc, item) => {
    const price = typeof item.product.price === "string" 
      ? Number.parseFloat(item.product.price.replaceAll(/[^0-9.]/g, "")) 
      : Number(item.product.price);
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#fdfcfb]">
      <div className="ritual-container max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Side: Address Selection/Form */}
          <div className="flex-1 space-y-8">
            <header>
              <Link href="/cart" className="text-[10px] uppercase tracking-widest text-[#b89b5e] font-bold hover:underline mb-4 inline-block">
                ← Back to Cart
              </Link>
              <h1 className="text-4xl font-serif text-[#2b2622] mb-2">Checkout</h1>
              <p className="text-[#6f6a65] font-light italic">Confirm your delivery details for this ritual.</p>
            </header>

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-[#2b2622]/5 shadow-sm space-y-8">
              <div>
                <h2 className="text-xl font-medium text-[#2b2622] mb-6">Shipping Destination</h2>
                
                {savedAddress && (
                  <div className="mb-8 space-y-4">
                    <button
                      onClick={() => setUseSavedAddress(true)}
                      className={`w-full text-left p-6 rounded-2xl border transition-all ${
                        useSavedAddress 
                          ? "border-[#b89b5e] bg-[#b89b5e]/5 shadow-md" 
                          : "border-[#2b2622]/10 bg-transparent hover:border-[#2b2622]/20"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#2b2622] mb-1">Saved Ritual Address</p>
                          <p className="text-sm text-[#6f6a65]">
                            {savedAddress.fullName}<br />
                            {savedAddress.addressLine}, {savedAddress.city}<br />
                            {savedAddress.state} - {savedAddress.postalCode}<br />
                            {savedAddress.country}
                          </p>
                        </div>
                        {useSavedAddress && (
                          <div className="w-5 h-5 bg-[#b89b5e] rounded-full flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setUseSavedAddress(false);
                        if (useSavedAddress) {
                          setShippingAddress({
                            fullName: "", phone: "", addressLine: "", city: "", state: "", postalCode: "", country: ""
                          });
                        }
                      }}
                      className={`w-full text-center py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        !useSavedAddress ? "text-[#b89b5e]" : "text-[#6f6a65] hover:text-[#2b2622]"
                      }`}
                    >
                      + Use a different address
                    </button>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {!useSavedAddress && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <form className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <InputField label="Full Name" name="fullName" value={shippingAddress.fullName} onChange={handleInputChange} />
                        <InputField label="Phone Number" name="phone" value={shippingAddress.phone} onChange={handleInputChange} />
                        <div className="md:col-span-2">
                          <InputField label="Address Line" name="addressLine" value={shippingAddress.addressLine} onChange={handleInputChange} />
                        </div>
                        <InputField label="City" name="city" value={shippingAddress.city} onChange={handleInputChange} />
                        <InputField label="State" name="state" value={shippingAddress.state} onChange={handleInputChange} />
                        <InputField label="Pincode / Zip" name="postalCode" value={shippingAddress.postalCode} onChange={handleInputChange} />
                        <InputField label="Country" name="country" value={shippingAddress.country} onChange={handleInputChange} />
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <aside className="w-full lg:w-[400px] shrink-0">
            <div className="sticky top-32 bg-[#2b2622] text-white p-8 rounded-[32px] shadow-2xl space-y-8">
              <h2 className="text-xl font-medium tracking-tight border-b border-white/10 pb-6 text-white/90">
                Ritual Summary
              </h2>

              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {item.quantity}
                      </span>
                      <span className="text-white/70 font-light italic truncate max-w-[150px]">
                        {item.product.name}
                      </span>
                    </div>
                    <span className="font-medium">
                      ₹{((typeof item.product.price === "string" 
                          ? Number.parseFloat(item.product.price.replaceAll(/[^0-9.]/g, "")) 
                          : Number(item.product.price)) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50 uppercase tracking-widest text-[10px] font-bold">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50 uppercase tracking-widest text-[10px] font-bold">Shipping</span>
                  <span className="text-[#b89b5e] italic font-medium">Complimentary</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-white/50 uppercase tracking-widest text-[12px] font-bold">Total</span>
                  <span className="text-3xl font-bold text-[#b89b5e]">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {message.text && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-[10px] font-bold uppercase tracking-widest text-center ${message.type === "error" ? "text-red-400" : "text-green-400"}`}
                    >
                      {message.text}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || !isAddressValid()}
                  className="w-full py-5 bg-[#b89b5e] text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-white hover:text-[#2b2622] transition-all transform hover:-translate-y-1 shadow-xl disabled:opacity-30 disabled:hover:translate-y-0"
                >
                  {placingOrder ? "Placing Order..." : "Finalize Order"}
                </button>
                <p className="text-[9px] text-center text-white/30 italic">
                  Secure checkout powered by RakaRituals
                </p>
              </div>
            </div>
          </aside>

        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

// eslint-disable-next-line react/prop-types
function InputField({ label, name, type = "text", value, onChange }) {
  return (
    <div className="space-y-1.5 flex flex-col">
      <label className="text-[10px] uppercase tracking-widest text-[#6f6a65] font-bold ml-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full bg-[#f8f5f2] border-0 rounded-xl px-4 py-3 text-sm text-[#2b2622] focus:ring-2 focus:ring-[#b89b5e]/20 transition-all outline-none italic placeholder:text-[#6f6a65]/40"
      />
    </div>
  );
}
