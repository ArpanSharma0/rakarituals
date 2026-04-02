"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, updateUserProfile, getMyOrders } from "@/utils/api";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen pt-32 pb-20 bg-[#fdfcfb]">
      <div className="ritual-container max-w-5xl mx-auto px-6">
        <header className="mb-12">
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
            className="text-[#6f6a65] font-light"
          >
            Manage your personal rituals and journey with us.
          </motion.p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-32 space-y-2 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-[#2b2622]/5">
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
          <main className="flex-1">
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
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-medium text-[#2b2622] mb-6">Ritual History</h2>
                    {orders.length === 0 ? (
                      <div className="text-center py-20 border-2 border-dashed border-[#2b2622]/10 rounded-3xl">
                        <p className="text-[#6f6a65] font-light italic">No rituals recorded yet.</p>
                        <button 
                          onClick={() => router.push("/")}
                          className="mt-4 text-[#b89b5e] font-medium hover:underline"
                        >
                          Discover your first ritual
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div 
                            key={order._id} 
                            className="p-6 bg-white rounded-2xl border border-[#2b2622]/5 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-[#6f6a65] mb-1">Order ID</p>
                                <p className="font-mono text-sm text-[#2b2622]">{order._id}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-widest text-[#6f6a65] mb-1">Date</p>
                                <p className="text-sm text-[#2b2622]">
                                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            
                            <div className="border-t border-[#2b2622]/5 pt-4 flex justify-between items-center">
                              <div className="flex -space-x-2">
                                {order.orderItems.map((item) => (
                                  <div 
                                    key={item.product || item._id || item.name} 
                                    className="w-10 h-10 rounded-full border-2 border-white bg-[#f8f5f2] flex items-center justify-center text-[10px] font-bold text-[#b89b5e] overflow-hidden"
                                    title={item.name}
                                  >
                                    {item.name.charAt(0)}
                                  </div>
                                ))}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-medium text-[#2b2622]">${order.totalPrice.toFixed(2)}</p>
                                <span className={`text-[10px] uppercase tracking-tighter font-bold px-2 py-1 rounded-full ${
                                  order.isPaid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                }`}>
                                  {order.isPaid ? "Paid" : "Pending Payment"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
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
