"use client";

import React, { useEffect, useState, Suspense } from "react";
import { getMyOrders, cancelOrderAPI } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import Navbar from "@/components/Navbar";
import Footer from "@/sections/Footer";

export function OrdersContent({ isNested = false }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get("success") === "true";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [dateRange, setDateRange] = useState("All Time");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelComments, setCancelComments] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [notification, setNotification] = useState(null);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleCancelOrder = (orderId) => {
    setCancellingOrderId(orderId);
    setCancelReason("");
    setCancelComments("");
  };

  const submitCancelOrder = async () => {
    if (!cancelReason) {
      alert("Please select a reason for cancelling your order.");
      return;
    }

    try {
      setIsSubmittingCancel(true);
      await cancelOrderAPI(cancellingOrderId, {
        cancelReason,
        cancelComments
      });

      // Update order state locally to reflect the cancelled state and survey details
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === cancellingOrderId 
            ? { 
                ...order, 
                deliveryStatus: 'Cancelled',
                cancelReason,
                cancelComments,
                cancelledAt: new Date().toISOString()
              } 
            : order
        )
      );

      // Close modal
      setCancellingOrderId(null);
    } catch (err) {
      console.error("Failed to cancel order:", err);
      alert(err.message || "Failed to cancel order. Please try again.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const socket = useSocket();

  const showNotification = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      if (!user) return;
      try {
        const data = await getMyOrders();
        setOrders(data || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleOrderCreated = (newOrder) => {
      const orderUserId = newOrder.user?._id || newOrder.user?.id || newOrder.user;
      const currentUserId = user._id || user.id;

      if (orderUserId && currentUserId && orderUserId.toString() === currentUserId.toString()) {
        setOrders((prevOrders) => {
          if (prevOrders.some((o) => o._id === newOrder._id)) return prevOrders;
          return [newOrder, ...prevOrders];
        });
        showNotification("success", `New Order Placed: #${newOrder._id?.slice(-8).toUpperCase()}`);
      }
    };

    const handleOrderUpdated = (updatedOrder) => {
      const orderUserId = updatedOrder.user?._id || updatedOrder.user?.id || updatedOrder.user;
      const currentUserId = user._id || user.id;

      if (orderUserId && currentUserId && orderUserId.toString() === currentUserId.toString()) {
        setOrders((prevOrders) =>
          prevOrders.map((ord) => (ord._id === updatedOrder._id ? updatedOrder : ord))
        );
        showNotification("success", `Order #${updatedOrder._id?.slice(-8).toUpperCase()} status updated to: ${updatedOrder.deliveryStatus}`);
      }
    };

    socket.on("orderCreated", handleOrderCreated);
    socket.on("orderUpdated", handleOrderUpdated);

    return () => {
      socket.off("orderCreated", handleOrderCreated);
      socket.off("orderUpdated", handleOrderUpdated);
    };
  }, [socket, user]);

  // Filter orders by active tab and selected date range
  const filteredOrders = orders.filter((order) => {
    // 1. Tab Filter
    if (activeTab === "In Progress") {
      if (order.deliveryStatus === "Delivered" || order.deliveryStatus === "Cancelled") return false;
    } else if (activeTab === "Delivered") {
      if (order.deliveryStatus !== "Delivered") return false;
    } else if (activeTab === "Cancelled") {
      if (order.deliveryStatus !== "Cancelled") return false;
    }

    // 2. Date Range Filter
    if (dateRange === "All Time") return true;
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    
    if (dateRange === "Last 30 Days") {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      return orderDate >= thirtyDaysAgo;
    }
    if (dateRange === "Last 6 Months") {
      const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
      return orderDate >= sixMonthsAgo;
    }
    if (dateRange === "Year 2026") {
      return orderDate.getFullYear() === 2026;
    }
    
    return true;
  });

  const getItemsSummary = (orderItems) => {
    if (!orderItems || orderItems.length === 0) return "No items";
    const names = orderItems.map(item => item.name || item.product?.name || "Ritual Item");
    if (names.length <= 3) {
      return names.join(" | ");
    } else {
      const shown = names.slice(0, 3).join(" | ");
      const extra = names.length - 3;
      return `${shown} & ${extra} more item${extra > 1 ? 's' : ''}`;
    }
  };

  const getFirstItemImage = (order) => {
    const firstItem = order.orderItems?.[0];
    if (firstItem?.product?.image) {
      return firstItem.product.image;
    }
    if (firstItem?.product?.images && firstItem.product.images.length > 0) {
      return firstItem.product.images[0];
    }
    return null;
  };

  const getTotalItemsCount = (order) => {
    return order.orderItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  };

  if (authLoading || (loading && user)) {
    return (
      <div className={isNested ? "py-20 flex items-center justify-center w-full bg-transparent" : "min-h-screen pt-4 px-6 flex items-center justify-center bg-[#fdfaf5]"}>
        <div className="text-sm font-bold uppercase tracking-[0.3em] text-[#2b2622]/40 animate-pulse">
          Loading your rituals...
        </div>
      </div>
    );
  }

  return (
    <div className={isNested ? "w-full" : "pt-28 pb-20 px-6 lg:px-12 bg-[#fdfaf5]"}>
      <div className={isNested ? "w-full" : "max-w-[1240px] mx-auto w-full"}>
        {/* Toast Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl border text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-all ${
                notification.type === "success" 
                  ? "bg-[#2b2622] text-white border-[#b89b5e]" 
                  : "bg-red-600 text-white border-red-700"
              }`}
            >
              {notification.type === "success" ? (
                <span className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
              ) : (
                <span className="w-2 h-2 bg-white rounded-full" />
              )}
              {notification.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Success Toast/Banner */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-green-50 border border-green-200/50 p-6 rounded-[24px] flex items-start gap-4 shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-green-950 mb-1">Ritual Payment Successful!</h2>
              <p className="text-sm text-green-700/90 font-light leading-relaxed">
                Your transaction has been verified and captured. Your spiritual order is now officially confirmed. Thank you for choosing RakaRituals!
              </p>
            </div>
          </motion.div>
        )}

        {!isNested && (
          <>

            {/* Header Title block */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 text-center md:text-left"
            >
              <h1 className="text-4xl md:text-5xl font-serif text-[#2b2622] leading-tight">My Orders</h1>
              <p className="text-xs text-[#6f6a65] font-light italic mt-2">Monitor delivery status, verify pricing breakdowns, and review billing receipts.</p>
            </motion.div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] text-[#6f6a65]/60 mb-6 font-black uppercase tracking-widest">
              <Link href="/" className="hover:text-[#b89b5e] transition-colors">Home</Link>
              <span>&gt;</span>
              <span className="text-[#2b2622]">My Orders</span>
            </div>
          </>
        )}

        {/* Pill Tabs & Date Range Select */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-[#2b2622]/5 pb-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2.5">
            {["All", "In Progress", "Delivered", "Cancelled"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                    isActive
                      ? "bg-[#2b2622] text-white border-[#2b2622] shadow-[0_4px_12px_rgba(43,38,34,0.1)]"
                      : "bg-white text-[#6f6a65]/80 border-[#e8e4de] hover:border-[#b89b5e] hover:text-[#2b2622]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Date Range Select Dropdown */}
          <div className="relative shrink-0 w-full sm:w-60 z-30">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="w-full bg-white border border-[#e8e4de] rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-wider text-[#6f6a65] hover:border-[#b89b5e] focus:border-[#b89b5e] outline-none shadow-sm flex items-center justify-between transition-all"
            >
              <span>{dateRange === "All Time" ? "Select Date Range" : dateRange}</span>
              <svg 
                width="10" 
                height="10" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${isDateDropdownOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <AnimatePresence>
              {isDateDropdownOpen && (
                <>
                  {/* Backdrop overlay to close dropdown on click outside */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDateDropdownOpen(false)}
                  />
                  
                  {/* Dropdown Menu options */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 5, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#e8e4de] rounded-[20px] shadow-[0_12px_30px_rgba(43,38,34,0.08)] overflow-hidden z-50"
                  >
                    {[
                      { value: "All Time", label: "Select Date Range" },
                      { value: "Last 30 Days", label: "Last 30 Days" },
                      { value: "Last 6 Months", label: "Last 6 Months" },
                      { value: "Year 2026", label: "Year 2026" }
                    ].map((option) => {
                      const isSelected = dateRange === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setDateRange(option.value);
                            setIsDateDropdownOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-wider transition-colors ${
                            isSelected 
                              ? "bg-[#b89b5e]/10 text-[#b89b5e] font-black" 
                              : "text-[#6f6a65] hover:bg-[#fdfaf5] hover:text-[#2b2622]"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Orders list rendering */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-[#e8e4de] shadow-[0_4px_20px_rgba(43,38,34,0.01)]">
            <p className="text-[#6f6a65] mb-6 font-medium italic text-sm">No orders matching your active selections.</p>
            <button 
              onClick={() => { setActiveTab("All"); setDateRange("All Time"); }}
              className="text-[#b89b5e] font-black uppercase tracking-widest text-[10px] hover:underline decoration-2 underline-offset-8"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => {
              const isExpanded = expandedOrderId === order._id;
              const totalQuantity = getTotalItemsCount(order);
              const firstImage = getFirstItemImage(order);
              const itemsSummary = getItemsSummary(order.orderItems);

              return (
                <motion.div
                  key={order._id || index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-5 sm:p-7 rounded-[24px] border border-[#e8e4de] hover:border-[#b89b5e]/40 shadow-[0_4px_20px_rgba(43,38,34,0.01)] hover:shadow-[0_10px_35px_rgba(184,155,94,0.06)] transition-all duration-300 group"
                >
                  {/* Clickable Header Area */}
                  <div 
                    onClick={() => toggleExpand(order._id)}
                    className="flex gap-4 sm:gap-6 items-center cursor-pointer select-none"
                  >
                    {/* Thumbnail on left */}
                    <div className="relative w-14 h-14 sm:w-20 sm:h-20 bg-[#f7f6f1] border border-[#2b2622]/5 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                      {firstImage ? (
                        <img src={firstImage} alt={order.orderItems?.[0]?.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#b89b5e]/5 text-[#b89b5e] font-serif text-lg font-bold">
                          {order.orderItems?.[0]?.name?.charAt(0) || "R"}
                        </div>
                      )}
                      {/* Count overlay if multiple items */}
                      {totalQuantity > 1 && (
                        <div className="absolute inset-0 bg-[#2b2622]/45 backdrop-blur-[1px] flex items-center justify-center text-white text-[10px] font-black uppercase">
                          +{totalQuantity - 1}
                        </div>
                      )}
                    </div>

                    {/* Text details in the middle */}
                    <div className="flex-1 min-w-0">
                      {/* Badge and date on top */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          order.deliveryStatus === 'Delivered'
                            ? 'bg-green-50 text-green-700'
                            : order.deliveryStatus === 'Cancelled'
                            ? 'bg-red-50 text-red-700'
                            : order.deliveryStatus === 'Dispatched'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-[#2b2622]/5 text-[#2b2622]'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            order.deliveryStatus === 'Delivered' 
                              ? 'bg-green-500' 
                              : order.deliveryStatus === 'Cancelled'
                              ? 'bg-red-500'
                              : order.deliveryStatus === 'Dispatched'
                              ? 'bg-amber-500'
                              : 'bg-[#2b2622]/40'
                          }`} />
                          {order.deliveryStatus === 'Delivered' 
                            ? 'Delivered' 
                            : order.deliveryStatus === 'Cancelled'
                            ? 'Cancelled'
                            : order.deliveryStatus === 'Dispatched'
                            ? 'Dispatched'
                            : 'Placed'}
                        </div>
                        <span className="text-[#6f6a65]/20 font-light text-xs hidden sm:inline">|</span>
                        <span className="text-[11px] text-[#6f6a65]/60 font-medium">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Order ID & Items summary */}
                      <h3 className="text-xs sm:text-[13px] font-bold text-[#b89b5e] uppercase tracking-wider mb-0.5">
                        Order ID: <span className="font-mono text-[#2b2622]">#{order._id?.slice(-8).toUpperCase()}</span>
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#6f6a65] font-light leading-relaxed truncate max-w-[95%]">
                        {itemsSummary}
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-[#2b2622] mt-1">
                        ₹{order.totalPrice?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    {/* Chevron Indicator on right */}
                    <div className="shrink-0 ml-2">
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="#b89b5e" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Receipt and Delivery Details */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        {/* Expanded details container */}
                        <div className="mt-8 border-t border-[#2b2622]/5 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                          {/* Shipping address info */}
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#b89b5e] mb-4">
                              Delivery & Billing Address
                            </h4>
                            <div className="bg-[#fcfbf9] p-5 rounded-2xl border border-[#2b2622]/5 space-y-2 text-[#2b2622] leading-relaxed">
                              <p className="font-bold text-sm">{order.shippingAddress?.fullName}</p>
                              <p className="font-light text-[#6f6a65]">{order.shippingAddress?.addressLine}</p>
                              <p className="font-light text-[#6f6a65]">
                                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                              </p>
                              <p className="font-light text-[#6f6a65]">{order.shippingAddress?.country}</p>
                              <p className="pt-2 font-semibold text-[11px] border-t border-[#2b2622]/5 text-[#b89b5e]">
                                Phone: {order.shippingAddress?.phone}
                              </p>
                            </div>
                          </div>

                          {/* Reference info */}
                          <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#b89b5e] mb-4">
                              Transaction Reference
                            </h4>
                            <div className="bg-[#fcfbf9] p-5 rounded-2xl border border-[#2b2622]/5 space-y-3 font-mono text-[10px]">
                              <div>
                                <span className="font-sans font-bold text-[9px] uppercase text-[#6f6a65]/60 block mb-0.5">Payment Method</span>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-block text-[9px] font-sans font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                                    order.paymentMethod === 'COD'
                                      ? 'bg-orange-50 text-orange-600 border-orange-200/50'
                                      : 'bg-blue-50 text-blue-600 border-blue-200/50'
                                  }`}>
                                    {order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                                  </span>
                                </div>
                              </div>
                              {order.razorpayOrderId && (
                                <div>
                                  <span className="font-sans font-bold text-[9px] uppercase text-[#6f6a65]/60 block mb-0.5">Razorpay Order ID</span>
                                  <span className="text-[#2b2622]">{order.razorpayOrderId}</span>
                                </div>
                              )}
                              {order.razorpayPaymentId && (
                                <div>
                                  <span className="font-sans font-bold text-[9px] uppercase text-[#6f6a65]/60 block mb-0.5">Razorpay Payment ID</span>
                                  <span className="text-[#2b2622]">{order.razorpayPaymentId}</span>
                                </div>
                              )}
                              {order.paidAt && (
                                <div>
                                  <span className="font-sans font-bold text-[9px] uppercase text-[#6f6a65]/60 block mb-0.5">Verified Capture Timestamp</span>
                                  <span className="font-sans text-[#2b2622]">{new Date(order.paidAt).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Referral Code details if active */}
                          {order.referralCode && (
                            <div className="md:col-span-2">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#b89b5e] mb-3">
                                Referral & Promo Details
                              </h4>
                              <div className="bg-[#b89b5e]/5 p-4 rounded-2xl border border-[#b89b5e]/15 space-y-1 text-xs">
                                <p className="text-[#2b2622] font-bold uppercase tracking-wider">
                                  Discount Code: <span className="text-[#b89b5e] font-black">{order.referralCode}</span>
                                </p>
                                {order.referral && (
                                  <p className="text-[#6f6a65] italic font-light">"{order.referral}"</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Visual Delivery Progress Tracker Stepper or Cancellation Banner */}
                        <div className="mt-8 border-t border-[#2b2622]/5 pt-8">
                          {order.deliveryStatus === 'Cancelled' ? (
                            <div className="bg-red-50/50 border border-red-200/50 p-6 rounded-2xl flex items-start gap-4 w-full">
                              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shrink-0 shadow-md">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </div>
                              <div className="space-y-2 flex-1">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600">Order Cancelled</h4>
                                <p className="text-[11px] text-red-800/80 font-light leading-relaxed">
                                  This ritual order has been cancelled. Any transaction charges captured will be processed according to our standard refund policies.
                                </p>
                                {order.cancelReason && (
                                  <div className="pt-3 border-t border-red-200/40 text-[10px] space-y-1.5 text-red-900/70">
                                    <p className="font-bold">
                                      Reason: <span className="font-light italic text-[#2b2622]">"{order.cancelReason}"</span>
                                    </p>
                                    {order.cancelComments && (
                                      <p className="font-bold">
                                        Feedback Notes: <span className="font-light italic text-[#2b2622]">"{order.cancelComments}"</span>
                                      </p>
                                    )}
                                    {order.cancelledAt && (
                                      <p className="text-[8.5px] text-red-800/50 font-light pt-0.5">
                                        Cancelled on: {new Date(order.cancelledAt).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#b89b5e] mb-6">
                                Order Journey & Delivery Status
                              </h4>
                              
                              <div className="relative flex justify-between items-center max-w-xl mx-auto px-4 py-2">
                                {/* Connecting Line background */}
                                <div className="absolute left-6 right-6 top-[18px] h-0.5 bg-[#e8e1d9] z-0" />
                                
                                {/* Connecting Line filled color */}
                                <div 
                                  className="absolute left-6 top-[18px] h-0.5 bg-[#b89b5e] transition-all duration-500 z-0" 
                                  style={{ 
                                    width: order.deliveryStatus === 'Delivered' 
                                      ? 'calc(100% - 48px)' 
                                      : order.deliveryStatus === 'Dispatched' 
                                      ? 'calc(50% - 24px)' 
                                      : '0%' 
                                  }}
                                />

                                {/* Step 1: Placed */}
                                <div className="relative z-10 flex flex-col items-center">
                                  <div className="w-5 h-5 rounded-full bg-[#b89b5e] flex items-center justify-center border-4 border-white shadow-sm">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                  </div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2b2622] mt-2">Placed</span>
                                  <span className="text-[8px] text-[#6f6a65] font-light mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>

                                {/* Step 2: Dispatched */}
                                <div className="relative z-10 flex flex-col items-center">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-300 ${
                                    ['Dispatched', 'Delivered'].includes(order.deliveryStatus) 
                                      ? 'bg-[#b89b5e]' 
                                      : 'bg-[#e8e1d9]'
                                  }`}>
                                    {['Dispatched', 'Delivered'].includes(order.deliveryStatus) && (
                                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                    )}
                                  </div>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors duration-300 ${
                                    ['Dispatched', 'Delivered'].includes(order.deliveryStatus) 
                                      ? 'text-[#2b2622]' 
                                      : 'text-[#6f6a65]/40'
                                  }`}>Dispatched</span>
                                  {order.dispatchedAt ? (
                                    <span className="text-[8px] text-[#6f6a65] font-light mt-0.5">{new Date(order.dispatchedAt).toLocaleDateString()}</span>
                                  ) : (
                                    <span className="text-[8px] text-[#6f6a65]/30 italic font-light mt-0.5">Pending</span>
                                  )}
                                </div>

                                {/* Step 3: Delivered */}
                                <div className="relative z-10 flex flex-col items-center">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-300 ${
                                    order.deliveryStatus === 'Delivered' 
                                      ? 'bg-[#b89b5e]' 
                                      : 'bg-[#e8e1d9]'
                                  }`}>
                                    {order.deliveryStatus === 'Delivered' && (
                                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                    )}
                                  </div>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors duration-300 ${
                                    order.deliveryStatus === 'Delivered' 
                                      ? 'text-[#2b2622]' 
                                      : 'text-[#6f6a65]/40'
                                  }`}>Delivered</span>
                                  {order.deliveredAt ? (
                                    <span className="text-[8px] text-[#6f6a65] font-light mt-0.5">{new Date(order.deliveredAt).toLocaleDateString()}</span>
                                  ) : (
                                    <span className="text-[8px] text-[#6f6a65]/30 italic font-light mt-0.5">Pending</span>
                                  )}
                                </div>

                              </div>
                            </>
                          )}
                        </div>

                        {/* Itemized Billing details */}
                        <div className="mt-8 border-t border-[#2b2622]/5 pt-8">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#b89b5e] mb-4">
                            Itemized Billing Breakdown
                          </h4>
                          <div className="space-y-3">
                            {(order.orderItems || order.items || []).map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs sm:text-sm bg-[#fcfbf9] px-4 py-3 rounded-xl border border-[#2b2622]/5">
                                <div>
                                  <span className="font-semibold text-[#2b2622]">{item.name || item.product?.name}</span>
                                  <span className="text-xs text-[#6f6a65]/60 ml-2 font-light">x{item.quantity}</span>
                                </div>
                                <span className="font-bold text-[#2b2622]">
                                  ₹{((item.price || 0) * item.quantity).toFixed(2)}
                                  <span className="text-[10px] text-[#6f6a65]/50 font-light ml-1.5">(₹{(item.price || 0).toFixed(2)} each)</span>
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between items-center border-t border-[#2b2622]/5 pt-4 px-4 font-bold text-base mt-2">
                              <span className="text-[#2b2622] uppercase tracking-wider text-[11px] font-black">Net Total Paid</span>
                              <span className="text-[#b89b5e] text-xl sm:text-2xl font-black">₹{order.totalPrice?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Panel: Cancel Order */}
                        {order.deliveryStatus === "Placed" && (
                          <div className="mt-8 pt-6 border-t border-[#2b2622]/5 flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelOrder(order._id);
                              }}
                              className="px-6 py-3 rounded-xl border border-red-200 hover:border-red-500 hover:bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm"
                            >
                              Cancel Order
                            </button>
                          </div>
                        )}

                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancellation Survey Modal */}
      <AnimatePresence>
        {cancellingOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Dark backdrop blur layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancellingOrderId(null)}
              className="fixed inset-0 bg-[#2b2622]/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#fdfaf5] border border-[#e8e4de] rounded-[24px] w-full max-w-md p-5 sm:p-6 shadow-[0_16px_40px_rgba(43,38,34,0.12)] z-50 overflow-hidden"
            >
              {/* Visual Top Highlight Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />

              <div className="space-y-4">
                <div>
                  <span className="text-red-500 font-black tracking-[0.25em] uppercase text-[8.5px] block mb-1.5">
                    Order Cancellation Survey
                  </span>
                  <h3 className="text-xl font-serif text-[#2b2622]">Why are you cancelling?</h3>
                  <p className="text-[11px] text-[#6f6a65] font-light mt-0.5">
                    Please help us improve the RakaRituals experience by telling us why you are cancelling.
                  </p>
                </div>

                {/* Radio buttons options */}
                <div className="space-y-2">
                  {[
                    "Order placed by mistake",
                    "Delivery timeline is too long",
                    "Found a better price elsewhere",
                    "Incorrect shipping details",
                    "Other reason"
                  ].map((reason) => {
                    const isSelected = cancelReason === reason;
                    return (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setCancelReason(reason)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? "bg-red-50/50 border-red-200 text-red-700 shadow-sm"
                            : "bg-white border-[#e8e4de] text-[#6f6a65] hover:border-[#b89b5e] hover:text-[#2b2622]"
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "border-red-500" : "border-[#dcd4cb]"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                        </div>
                        <span>{reason}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Textarea for comments */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black uppercase tracking-widest text-[#6f6a65]/80">
                    Additional Feedback (Optional)
                  </label>
                  <textarea
                    value={cancelComments}
                    onChange={(e) => setCancelComments(e.target.value)}
                    placeholder="Please let us know how we can serve you better next time..."
                    className="w-full bg-white border border-[#e8e4de] hover:border-[#b89b5e] focus:border-[#b89b5e] rounded-xl p-3 text-xs font-light text-[#2b2622] outline-none min-h-[70px] transition-all placeholder:text-[#6f6a65]/40"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-1.5">
                  <button
                    type="button"
                    disabled={isSubmittingCancel}
                    onClick={submitCancelOrder}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                  >
                    {isSubmittingCancel ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <span>Confirm</span>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    disabled={isSubmittingCancel}
                    onClick={() => setCancellingOrderId(null)}
                    className="w-full bg-white hover:bg-[#b89b5e]/5 text-[#6f6a65] border border-[#e8e4de] hover:border-[#b89b5e] py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300"
                  >
                    Keep Order
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-4 px-6 flex items-center justify-center bg-[#fdfaf5]">
        <div className="text-sm font-bold uppercase tracking-[0.3em] text-[#2b2622]/40 animate-pulse">
          Loading your ritual history...
        </div>
      </div>
    }>
      <div className="bg-[#fdfaf5] min-h-screen flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow">
          <OrdersContent />
        </main>
        <Footer />
      </div>
    </Suspense>
  );
}
