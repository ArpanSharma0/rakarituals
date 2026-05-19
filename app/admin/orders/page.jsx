"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getAllOrders, updateOrderDeliveryStatus } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";

const LoadingSpinner = ({ size = "w-6 h-6", color = "border-[#b89b5e]" }) => (
  <div className={`${size} border-2 ${color} border-t-transparent rounded-full animate-spin`}></div>
);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle global click to close dropdowns when clicking outside
  useEffect(() => {
    const handleGlobalClick = (event) => {
      if (!event.target.closest(".status-dropdown-container")) {
        setOpenDropdownId(null);
      }
      if (!event.target.closest(".order-date-filter-container")) {
        setIsDateDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      showNotification("error", error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const updatedOrder = await updateOrderDeliveryStatus(orderId, newStatus);
      
      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((ord) => (ord._id === orderId ? { ...ord, ...updatedOrder } : ord))
      );
      
      showNotification("success", `Order status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating order status:", error);
      showNotification("error", error.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const showNotification = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 3000);
  };

  // Stats calculation
  const stats = orders.reduce(
    (acc, ord) => {
      acc.total += 1;
      acc.revenue += ord.isPaid ? ord.totalPrice : 0;
      if (ord.deliveryStatus === "Placed") acc.placed += 1;
      else if (ord.deliveryStatus === "Dispatched") acc.dispatched += 1;
      else if (ord.deliveryStatus === "Delivered") acc.delivered += 1;
      else if (ord.deliveryStatus === "Cancelled") acc.cancelled += 1;
      return acc;
    },
    { total: 0, revenue: 0, placed: 0, dispatched: 0, delivered: 0, cancelled: 0 }
  );

  // Dynamic search and date filtering engine
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search Query Match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const clientName = (order.user?.name || "Guest Customer").toLowerCase();
        const clientEmail = (order.user?.email || "N/A").toLowerCase();
        const orderId = (order._id || "").toLowerCase();
        const addressName = (order.shippingAddress?.fullName || "").toLowerCase();
        const itemsMatch = (order.orderItems || order.items || []).some((item) => 
          (item.name || item.product?.name || "").toLowerCase().includes(query)
        );

        if (
          !clientName.includes(query) &&
          !clientEmail.includes(query) &&
          !orderId.includes(query) &&
          !addressName.includes(query) &&
          !itemsMatch
        ) {
          return false;
        }
      }

      // 2. Date Filter Match
      if (dateFilter !== "all") {
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (dateFilter === "today") {
          if (orderDate < todayStart) return false;
        } else if (dateFilter === "yesterday") {
          const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
          if (orderDate < yesterdayStart || orderDate >= todayStart) return false;
        } else if (dateFilter === "7") {
          const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (orderDate < sevenDaysAgo) return false;
        } else if (dateFilter === "30") {
          const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (orderDate < thirtyDaysAgo) return false;
        }
      }

      return true;
    });
  }, [orders, searchQuery, dateFilter]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <LoadingSpinner size="w-12 h-12" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2b2622]/40 animate-pulse">
          Summoning Admin Records...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
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

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#dcd4cb] pb-6">
        <div>
          <span className="text-[#b89b5e] font-black tracking-[0.3em] uppercase text-[10px] block mb-2">
            Elite Command Panel
          </span>
          <h1 className="text-4xl font-serif text-[#2b2622] leading-tight">Master Orders List</h1>
          <p className="text-xs text-[#6f6a65] font-light italic mt-1">
            Dispatch, deliver, and track client spiritual orders.
          </p>
        </div>
        <button 
          onClick={fetchOrders}
          className="bg-white hover:bg-[#b89b5e]/5 text-[#2b2622] border border-[#dcd4cb] hover:border-[#b89b5e] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all"
        >
          Refresh Orders
        </button>
      </header>


      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#dcd4cb]">
          <p className="text-[#6f6a65] italic font-light">No client orders have been registered yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-[#dcd4cb] overflow-hidden shadow-sm min-h-[350px]">
          
          {/* High-density Filtering Panel */}
          {/* High-density Filtering Panel */}
          <div className="p-3 sm:p-4 border-b border-[#f2eee9] flex flex-row items-center justify-between gap-3 bg-[#fcfbf9]/50 w-full">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xs sm:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6f6a65]/40">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[34px] bg-white border border-[#dcd4cb] rounded-xl pl-9 pr-7 text-[9px] sm:text-[10px] font-medium text-[#2b2622] placeholder:text-[#6f6a65]/40 outline-none focus:border-[#b89b5e] focus:ring-1 focus:ring-[#b89b5e] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#6f6a65]/40 hover:text-[#2b2622] cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Date Filter Selection */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Funnel Icon (Desktop/Tablet Only) */}
              <span className="hidden sm:inline-block text-[#b89b5e] shrink-0" title="Filter by Date">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
              </span>
              
              {/* Date Filter Dropdown */}
              <div className="relative w-[34px] sm:w-36 order-date-filter-container">
                <button
                  type="button"
                  onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                  className="appearance-none bg-white border border-[#dcd4cb] rounded-xl text-[#2b2622] cursor-pointer transition-all duration-300 hover:bg-[#e8e1d9]/30 flex items-center justify-center sm:justify-between w-[34px] h-[34px] sm:w-full sm:h-[34px] sm:pl-3 sm:pr-8 text-[8px] sm:text-[9px] font-black uppercase tracking-wider"
                >
                  {/* Funnel Icon (Mobile Only) */}
                  <span className="sm:hidden text-[#b89b5e] flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                    </svg>
                  </span>

                  {/* Selected Text (Desktop/Tablet Only) */}
                  <span className="hidden sm:block truncate">
                    {dateFilter === "all" ? "All Time" :
                     dateFilter === "today" ? "Today" :
                     dateFilter === "yesterday" ? "Yesterday" :
                     dateFilter === "7" ? "7 Days" : "30 Days"}
                  </span>

                  {/* Arrow Icon (Desktop/Tablet Only) */}
                  <div 
                    className="hidden sm:block absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b89b5e] transition-transform duration-300 pointer-events-none"
                    style={{ transform: isDateDropdownOpen ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }}
                  >
                    <svg width="6" height="4" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>

                {isDateDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1.5 z-50 bg-[#e8e1d9] border border-[#dcd4cb] rounded-xl p-1 shadow-[0_10px_30px_rgba(43,38,34,0.12)] w-28 sm:w-full backdrop-blur-md flex flex-col gap-0.5 origin-top-right transition-all">
                    {[
                      { label: "All Time", val: "all" },
                      { label: "Today", val: "today" },
                      { label: "Yesterday", val: "yesterday" },
                      { label: "7 Days", val: "7" },
                      { label: "30 Days", val: "30" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => {
                          setDateFilter(opt.val);
                          setIsDateDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider rounded-lg transition-all duration-300 cursor-pointer ${
                          dateFilter === opt.val
                            ? "bg-[#2b2622] text-white shadow-sm"
                            : "text-[#6f6a65] hover:text-[#2b2622] hover:bg-white/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white">
                <p className="text-[#6f6a65] italic font-light">No orders match your search query or selected date filter.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fcfbf9] border-b border-[#f2eee9] text-[#6f6a65] text-[10px] font-black uppercase tracking-wider">
                    <th className="py-5 px-6">Client / Order ID</th>
                    <th className="py-5 px-6">Ritual Items</th>
                    <th className="py-5 px-6">Total / Payment</th>
                    <th className="py-5 px-6">Referral Code</th>
                    <th className="py-5 px-6">Journey Tracker</th>
                    <th className="py-5 px-6">Action Control</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => {
                    const isLastRow = index === filteredOrders.length - 1 && filteredOrders.length > 1;
                    return (
                    <tr key={order._id} className="border-b border-[#f2eee9] hover:bg-[#fcfbf9]/50 transition-colors text-xs text-[#2b2622]">
                    {/* User info */}
                    <td className="py-6 px-6 space-y-1">
                      <p className="font-bold text-[#2b2622]">{order.user?.name || "Guest Customer"}</p>
                      <p className="text-[10px] text-[#6f6a65] font-light">{order.user?.email || "N/A"}</p>
                      <span className="inline-block font-mono text-[9px] text-[#b89b5e] uppercase font-bold tracking-wider">
                        #{order._id?.slice(-8).toUpperCase()}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="py-6 px-6">
                      <div className="space-y-1">
                        {(order.orderItems || order.items || []).map((item, idx) => (
                          <p key={idx} className="font-medium text-[#2b2622]">
                            {item.name || item.product?.name} <span className="text-[#6f6a65]/60 font-light">x{item.quantity}</span>
                          </p>
                        ))}
                      </div>
                    </td>

                    {/* Price and Payment status */}
                    <td className="py-6 px-6 space-y-1.5">
                      <p className="font-bold text-[#2b2622] text-sm">₹{order.totalPrice?.toFixed(2)}</p>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${order.isPaid ? 'bg-green-500' : 'bg-amber-500'}`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${order.isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                          {order.isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </div>
                      <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        order.paymentMethod === 'COD'
                          ? 'bg-orange-50 text-orange-600 border-orange-200/50'
                          : 'bg-blue-50 text-blue-600 border-blue-200/50'
                      }`}>
                        {order.paymentMethod === 'COD' ? '💵 COD' : '💳 Online'}
                      </span>
                    </td>

                    {/* Referral */}
                    <td className="py-6 px-6">
                      {order.referralCode ? (
                        <div className="space-y-0.5">
                          <span className="bg-[#b89b5e]/15 border border-[#b89b5e]/25 text-[#b89b5e] px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                            {order.referralCode}
                          </span>
                          {order.referral && (
                            <p className="text-[9px] text-[#6f6a65] italic max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                              "{order.referral}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#6f6a65]/35 italic">-</span>
                      )}
                    </td>

                    {/* Journey Status display */}
                    <td className="py-6 px-6 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          order.deliveryStatus === "Delivered"
                            ? "bg-green-50 text-green-700 border-green-200/50"
                            : order.deliveryStatus === "Cancelled"
                            ? "bg-red-50 text-red-700 border-red-200/50 animate-pulse"
                            : order.deliveryStatus === "Dispatched"
                            ? "bg-amber-50 text-amber-700 border-amber-200/50"
                            : "bg-[#2b2622]/5 text-[#2b2622] border-[#2b2622]/10"
                        }`}>
                          {order.deliveryStatus || "Placed"}
                        </span>
                      </div>
                      {order.dispatchedAt && (
                        <p className="text-[9px] text-[#6f6a65] font-light">
                          Dispatched: {new Date(order.dispatchedAt).toLocaleDateString()}
                        </p>
                      )}
                      {order.deliveredAt && (
                        <p className="text-[9px] text-[#6f6a65] font-light">
                          Delivered: {new Date(order.deliveredAt).toLocaleDateString()}
                        </p>
                      )}
                      {order.deliveryStatus === "Cancelled" && order.cancelReason && (
                        <div className="text-[9px] text-red-800/80 font-light mt-1.5 pt-1.5 border-t border-red-200/30 max-w-[180px] space-y-0.5">
                          <p className="font-bold">Reason: <span className="font-light italic text-[#2b2622]">"{order.cancelReason}"</span></p>
                          {order.cancelComments && (
                            <p className="font-bold">Notes: <span className="font-light italic text-[#2b2622]">"{order.cancelComments}"</span></p>
                          )}
                          {order.cancelledAt && (
                            <p className="text-[8px] text-red-800/50 pt-0.5">Cancelled: {new Date(order.cancelledAt).toLocaleString()}</p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Change Action Control */}
                    <td className="py-6 px-6 relative">
                      {updatingId === order._id ? (
                        <LoadingSpinner size="w-5 h-5" />
                      ) : (
                        <div className="relative w-36 status-dropdown-container">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === order._id ? null : order._id)}
                            className="appearance-none bg-[#fcfbf9] border border-[#dcd4cb] rounded-xl pl-4 pr-9 py-2 text-[10px] font-bold uppercase tracking-wider text-[#2b2622] cursor-pointer transition-all duration-300 hover:bg-[#e8e1d9] flex items-center justify-between w-full"
                          >
                            <span>{order.deliveryStatus || "Placed"}</span>
                            <div 
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b89b5e] pointer-events-none transition-transform duration-300" 
                              style={{ transform: openDropdownId === order._id ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }}
                            >
                              <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </button>

                          {/* Absolute Dropdown List Panel */}
                          {openDropdownId === order._id && (
                            <div className={`absolute left-0 z-50 bg-[#e8e1d9] border border-[#dcd4cb] rounded-2xl p-1.5 shadow-[0_15px_40px_rgba(43,38,34,0.15)] w-full backdrop-blur-md flex flex-col gap-1 transition-all ${
                              isLastRow ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"
                            }`}>
                              {[
                                { label: "Placed", val: "Placed" },
                                { label: "Dispatched", val: "Dispatched" },
                                { label: "Delivered", val: "Delivered" },
                                { label: "Cancelled", val: "Cancelled" },
                              ].map((opt) => (
                                <button
                                  key={opt.val}
                                  onClick={() => {
                                    handleStatusChange(order._id, opt.val);
                                    setOpenDropdownId(null);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ${
                                    (order.deliveryStatus || "Placed") === opt.val
                                      ? "bg-[#2b2622] text-white shadow-md scale-[1.03]"
                                      : "text-[#6f6a65] hover:text-[#2b2622] hover:bg-white/40"
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
