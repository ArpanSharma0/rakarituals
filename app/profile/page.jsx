"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, updateUserProfile, getMyOrders } from "@/utils/api";
import { useRouter } from "next/navigation";
import { OrdersContent } from "../orders/page";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";
export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: {
      fullName: "",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await getUserProfile();
        setFormData({
          name: profileData.name || "",
          email: profileData.email || "",
          address: {
            fullName: profileData.address?.fullName || "",
            phone: profileData.address?.phone || "",
            addressLine: profileData.address?.addressLine || "",
            city: profileData.address?.city || "",
            state: profileData.address?.state || "",
            postalCode: profileData.address?.postalCode || "",
            country: profileData.address?.country || "",
          },
        });

        const ordersData = await getMyOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      await updateUserProfile(formData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update profile" });
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb]">
        <div className="w-12 h-12 border-4 border-[#b89b5e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: "info", label: "Account Info" },
    { id: "address", label: "Address Book" },
    { id: "orders", label: "Order History" },
  ];

  return (
    <div className="bg-[#fdfcfb] min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow pt-28 pb-20">
        <div className="ritual-container max-w-[1240px] mx-auto px-6 lg:px-12 w-full">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Column: Fixed / Sticky Header & Tabs */}
          <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-28 space-y-6">
            <header>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-serif text-[#2b2622] mb-2"
              >
                My Sacred Space
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[#6f6a65] font-light text-sm"
              >
                Manage your personal rituals and journey with us.
              </motion.p>
            </header>

            {/* Sidebar Tabs */}
            <div className="space-y-2 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-[#2b2622]/5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-5 py-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id 
                      ? "bg-[#2b2622] text-white shadow-lg" 
                      : "text-[#6f6a65] hover:bg-[#2b2622]/5 hover:text-[#2b2622]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-[#2b2622]/5 shadow-sm min-h-[500px]">
              <AnimatePresence mode="wait">
                {activeTab === "info" && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-medium text-[#2b2622] mb-6">Personal Rituals</h2>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField 
                            label="Full Name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                          />
                          <InputField 
                            label="Email Address" 
                            name="email" 
                            type="email"
                            value={formData.email} 
                            onChange={handleInputChange} 
                          />
                        </div>
                        
                        <div className="pt-4 flex items-center justify-between">
                          <AnimatePresence>
                            {message.text && (
                              <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
                              >
                                {message.text}
                              </motion.p>
                            )}
                          </AnimatePresence>
                          <button 
                            type="submit" 
                            disabled={isUpdating}
                            className="ritual-btn-primary ml-auto"
                          >
                            {isUpdating ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {activeTab === "address" && (
                  <motion.div
                    key="address"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-medium text-[#2b2622] mb-6">Address for Deliveries</h2>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField 
                            label="Recipient Name" 
                            name="address.fullName" 
                            value={formData.address.fullName} 
                            onChange={handleInputChange} 
                          />
                          <InputField 
                            label="Phone Number" 
                            name="address.phone" 
                            value={formData.address.phone} 
                            onChange={handleInputChange} 
                          />
                          <div className="md:col-span-2">
                            <InputField 
                              label="Street Address" 
                              name="address.addressLine" 
                              value={formData.address.addressLine} 
                              onChange={handleInputChange} 
                            />
                          </div>
                          <InputField 
                            label="City" 
                            name="address.city" 
                            value={formData.address.city} 
                            onChange={handleInputChange} 
                          />
                          <InputField 
                            label="State / Province" 
                            name="address.state" 
                            value={formData.address.state} 
                            onChange={handleInputChange} 
                          />
                          <InputField 
                            label="Postal Code" 
                            name="address.postalCode" 
                            value={formData.address.postalCode} 
                            onChange={handleInputChange} 
                          />
                          <InputField 
                            label="Country" 
                            name="address.country" 
                            value={formData.address.country} 
                            onChange={handleInputChange} 
                          />
                        </div>
                        
                        <div className="pt-4 flex items-center justify-between">
                          <AnimatePresence>
                            {message.text && (
                              <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
                              >
                                {message.text}
                              </motion.p>
                            )}
                          </AnimatePresence>
                          <button 
                            type="submit" 
                            disabled={isUpdating}
                            className="ritual-btn-primary ml-auto"
                          >
                            {isUpdating ? "Saving Address..." : "Save Address"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {activeTab === "orders" && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full"
                  >
                    <OrdersContent isNested={true} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
          </div>
        </div>
      </main>
      <Footer />
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
        className="w-full bg-[#f8f5f2] border-0 rounded-xl px-4 py-3 text-sm text-[#2b2622] focus:ring-2 focus:ring-[#b89b5e]/20 transition-all outline-none italic placeholder:text-[#6f6a65]/40"
      />
    </div>
  );
}
