"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getUserProfile, updateUserProfile, placeOrder, verifyPayment } from "@/utils/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { cartItems = [], loading: cartLoading, refreshCart } = useCart();
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
  const [referralCode, setReferralCode] = useState("");
  const [referral, setReferral] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online"); // "Online" or "COD"

  const isCODAllowed = cartItems.every(
    (item) => item.product && item.product.isCODAllowed !== false
  );

  useEffect(() => {
    if (!isCODAllowed && paymentMethod === "COD") {
      setPaymentMethod("Online");
    }
  }, [isCODAllowed, paymentMethod]);

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
    if (!loading && !cartLoading && cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartItems, loading, cartLoading, router]);

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
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

      // Calculate subtotal
      const subtotal = cartItems.reduce((acc, item) => {
        const price = typeof item.product.price === "string" 
          ? Number.parseFloat(item.product.price.replaceAll(/[^0-9.]/g, "")) 
          : Number(item.product.price);
        return acc + price * item.quantity;
      }, 0);

      // 2. If Cash on Delivery, place order directly
      if (paymentMethod === "COD") {
        setMessage({ type: "info", text: "Registering Cash on Delivery order..." });
        await placeOrder({ 
          shippingAddress,
          items: cartItems,
          totalPrice: subtotal,
          referralCode,
          referral,
          paymentMethod: "COD",
        });

        setMessage({ type: "success", text: "Order placed successfully! Redirecting..." });
        await refreshCart();
        setTimeout(() => {
          router.push("/orders?success=true");
        }, 1500);
        return;
      }

      // 3. Otherwise (Online payment), load the Razorpay script
      setMessage({ type: "info", text: "Initializing payment gateway..." });
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setMessage({ type: "error", text: "Failed to load payment gateway SDK. Please check your internet connection." });
        setPlacingOrder(false);
        return;
      }

      // 4. Place the order with shippingAddress, referral, and Online payment method details
      const res = await placeOrder({ 
        shippingAddress,
        items: cartItems,
        totalPrice: subtotal,
        referralCode,
        referral,
        paymentMethod: "Online",
      });

      if (!res.razorpayOrder) {
        throw new Error("Razorpay order creation failed on backend");
      }

      // 5. Open Razorpay Checkout Modal
      const options = {
        key: res.razorpayKey,
        amount: res.razorpayOrder.amount,
        currency: res.razorpayOrder.currency || "INR",
        name: "RakaRituals",
        description: "Spiritual Products & Meditational Rituals",
        order_id: res.razorpayOrder.id,
        handler: async function (response) {
          try {
            setPlacingOrder(true);
            setMessage({ type: "info", text: "Verifying payment transaction... Please do not close this window." });

            const verification = await verifyPayment(res.order._id, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            setMessage({ type: "success", text: "Payment verified! Completing checkout..." });
            
            // Clear cart
            await refreshCart();
            
            // Redirect to orders page with success indicator
            setTimeout(() => {
              router.push("/orders?success=true");
            }, 1500);
          } catch (err) {
            console.error("Verification error:", err);
            setMessage({ type: "error", text: err.message || "Signature verification failed. Payment might be in hold." });
          } finally {
            setPlacingOrder(false);
          }
        },
        prefill: {
          name: shippingAddress.fullName || user?.name || "",
          email: user?.email || "",
          contact: shippingAddress.phone || "",
        },
        notes: {
          address: shippingAddress.addressLine,
          referralCode: referralCode,
        },
        theme: {
          color: "#b89b5e",
        },
        modal: {
          ondismiss: function () {
            setMessage({ type: "error", text: "Payment process cancelled." });
            setPlacingOrder(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment setup error:", error);
      setMessage({ type: "error", text: error.message || "Failed to initiate payment. Please try again." });
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
    <div className="min-h-screen pt-4 pb-20 bg-[#fdfcfb]">
      <div className="ritual-container max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
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

                <div className="border-t border-[#2b2622]/10 pt-6 mt-8 space-y-6">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-[#6f6a65] font-bold mb-4">
                      Select Payment Method
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("Online")}
                        className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                          paymentMethod === "Online" 
                            ? "border-[#b89b5e] bg-[#b89b5e]/5 shadow-sm" 
                            : "border-[#2b2622]/10 bg-transparent hover:border-[#2b2622]/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-[#2b2622] text-xs">Online Payment</p>
                            <p className="text-[10px] text-[#6f6a65] mt-1 font-light">Pay securely via UPI, Cards, or Netbanking</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            paymentMethod === "Online" ? "border-[#b89b5e] bg-[#b89b5e]" : "border-[#2b2622]/20"
                          }`}>
                            {paymentMethod === "Online" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isCODAllowed) {
                            setPaymentMethod("COD");
                          }
                        }}
                        disabled={!isCODAllowed}
                        className={`text-left p-5 rounded-2xl border transition-all ${
                          !isCODAllowed
                            ? "border-[#2b2622]/5 bg-[#fbfbfa] opacity-60 cursor-not-allowed"
                            : paymentMethod === "COD" 
                            ? "border-[#b89b5e] bg-[#b89b5e]/5 shadow-sm cursor-pointer" 
                            : "border-[#2b2622]/10 bg-transparent hover:border-[#2b2622]/20 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-[#2b2622] text-xs">Cash on Delivery (COD)</p>
                            {isCODAllowed ? (
                              <p className="text-[10px] text-[#6f6a65] mt-1 font-light">Pay in cash when your spiritual offering is delivered</p>
                            ) : (
                              <p className="text-[10px] text-red-500 mt-1 font-medium italic">Not available for one or more items in cart</p>
                            )}
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            !isCODAllowed 
                              ? "border-[#2b2622]/10 bg-[#f2eee9]" 
                              : paymentMethod === "COD" 
                              ? "border-[#b89b5e] bg-[#b89b5e]" 
                              : "border-[#2b2622]/20"
                          }`}>
                            {paymentMethod === "COD" && isCODAllowed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-[#2b2622]/10 pt-6">
                    <h3 className="text-xs uppercase tracking-widest text-[#6f6a65] font-bold mb-4">
                      Referral & Promotions (Optional)
                    </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Referral / Promo Code"
                      name="referralCode"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="e.g. RAKA_LOVE_7"
                      required={false}
                    />
                    <InputField
                      label="Referral Source / Notes"
                      name="referral"
                      value={referral}
                      onChange={(e) => setReferral(e.target.value)}
                      placeholder="How did you hear about us?"
                      required={false}
                    />
                  </div>
                </div>
              </div>
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
function InputField({ label, name, type = "text", value, onChange, placeholder = "", required = true }) {
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
        required={required}
        placeholder={placeholder}
        className="w-full bg-[#f8f5f2] border-0 rounded-xl px-4 py-3 text-sm text-[#2b2622] focus:ring-2 focus:ring-[#b89b5e]/20 transition-all outline-none italic placeholder:text-[#6f6a65]/40"
      />
    </div>
  );
}
