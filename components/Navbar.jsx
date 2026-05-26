"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter, usePathname } from "next/navigation";
import SearchBar from "./SearchOverlay";
import { fetchActiveCoupons } from "@/utils/api";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartItems = [] } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [coupons, setCoupons] = useState([]);
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);

  useEffect(() => {
    const getCoupons = async () => {
      try {
        const data = await fetchActiveCoupons();
        setCoupons(data || []);
      } catch (err) {
        console.error("Failed to load active coupons:", err);
      }
    };
    getCoupons();
  }, []);

  useEffect(() => {
    if (coupons.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentCouponIndex((prev) => (prev + 1) % coupons.length);
    }, 4500); // Rotate every 4.5 seconds
    return () => clearInterval(interval);
  }, [coupons]);

  const isProductPage = pathname?.startsWith("/product");
  const isHomepage = pathname === "/";

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = isHomepage ? window.innerHeight * 0.9 : 50;
      setScrolled(window.scrollY > threshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomepage]);

  const { scrollY } = useScroll();
  const [h, setH] = useState(0);
  useEffect(() => {
    setH(window.innerHeight);
  }, []);

  const navOpacity = useTransform(scrollY, [2.1 * h, 2.2 * h], [0, 1]);
  
  // Theme state: white/opaque for sub-pages or scrolled homepage, transparent for top of homepage
  const isWhiteNav = !isHomepage || isProductPage || scrolled || mobileMenuOpen;
  const useDarkIcons = isWhiteNav || mobileMenuOpen;
  const linkColor = useDarkIcons ? "text-[#3b2f2f] hover:text-[#2b2622]" : "text-white/80 hover:text-white";
  const logoColor = useDarkIcons ? "text-[#3b2f2f]" : "text-white";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleLinkClick = (e, href) => {
    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.replace("/#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="fixed top-0 left-0 w-full bg-[#FB9E5B] text-white text-[9px] font-bold uppercase tracking-[0.2em] z-50 h-[28px] flex items-center justify-center overflow-hidden">
        {coupons.length > 0 ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCouponIndex}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute text-center px-4 w-full truncate leading-none"
              >
                {coupons[currentCouponIndex].description}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="px-4 text-center">
            10% OFF ON FIRST ORDERS • FREE SHIPPING OVER ₹799
          </div>
        )}
      </div>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 backdrop-blur-xl top-[28px] ${
          isWhiteNav 
            ? "bg-white/95 shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-[#2b2622]/5 py-4"
            : "bg-transparent border-b border-white/0 py-6"
        }`}
      >
        {/* Desktop Header */}
        <div className="hidden md:flex ritual-container items-center justify-between px-6">
          {/* Left: Logo */}
          <motion.div 
            className={`text-2xl font-bold tracking-tighter uppercase w-[240px] transition-colors duration-500 ${logoColor}`}
          >
            <Link href="/" className="flex items-center gap-2.5">
              <img 
                src="/assets/images/raka_favicon.png" 
                alt="RakaRituals Logo" 
                className="w-8 h-8 object-contain brightness-110 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
              />
              <span>RAKARITUALS</span>
            </Link>
          </motion.div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium uppercase tracking-wide">
            {[
              { label: "Home", href: "/" },
              { label: "Products", href: "/#all-products" },
              { label: "About", href: "/#about" },
              { label: "Contact", href: "/#contact" },
            ].map((item) => (
              <Link 
                key={item.label}
                href={item.href} 
                onClick={(e) => handleLinkClick(e, item.href)}
                className={`relative py-1 transition-colors duration-300 group ${linkColor}`}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-current transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Right: Search, Login/SignUp & Cart */}
          <div className="hidden md:flex items-center gap-5">
            {/* Search */}
            <SearchBar linkColor={linkColor} />

            {user ? (
              <div className="relative group">
                {/* Avatar Trigger button */}
                <button className="flex items-center gap-2.5 outline-none group cursor-pointer py-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border border-[#b89b5e]/20 transition-transform duration-300 group-hover:scale-105 ${
                    isWhiteNav 
                      ? "bg-[#2b2622] text-white" 
                      : "bg-white text-[#2b2622]"
                  }`}>
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 ${linkColor}`}>
                    {user.name}
                  </span>
                  <span className={`text-[7px] transition-transform duration-300 group-hover:rotate-180 ${linkColor} opacity-60`}>
                    ▼
                  </span>
                </button>

                {/* Dropdown Menu Container */}
                <div className="absolute right-0 top-full pt-2 w-48 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="bg-white/95 backdrop-blur-xl border border-[#2b2622]/5 shadow-2xl rounded-2xl p-1.5 flex flex-col gap-0.5 overflow-hidden">
                    <div className="px-3.5 py-2.5 border-b border-[#2b2622]/5 mb-1">
                      <p className="text-[8px] text-[#6f6a65]/50 uppercase tracking-widest font-black mb-0.5">Sacred Account</p>
                      <p className="text-xs font-bold text-[#2b2622] truncate">{user.name}</p>
                    </div>
                    <Link 
                      href="/profile"
                      className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-[#6f6a65] hover:bg-[#2b2622]/5 hover:text-[#2b2622] transition-colors flex items-center gap-2.5"
                    >
                      <svg className="w-4 h-4 text-[#b89b5e] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link 
                      href="/orders"
                      className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-[#6f6a65] hover:bg-[#2b2622]/5 hover:text-[#2b2622] transition-colors flex items-center gap-2.5"
                    >
                      <svg className="w-4 h-4 text-[#b89b5e] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      My Orders
                    </Link>
                    <Link 
                      href="/wishlist"
                      className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium text-[#6f6a65] hover:bg-[#2b2622]/5 hover:text-[#2b2622] transition-colors flex items-center gap-2.5"
                    >
                      <svg className="w-4 h-4 text-[#b89b5e] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      My Wishlist
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2.5 border-t border-[#2b2622]/5 mt-1 cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-rose-500 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link 
                href="/login" 
                className={`text-sm font-medium uppercase tracking-wide transition-colors duration-300 ${linkColor}`}
              >
                Login / Sign Up
              </Link>
            )}

            {/* Cart Icon */}
            <Link href="/cart" className="btn-icon relative" aria-label="Cart">
              <svg className={linkColor} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#2b2622] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Header (realigned to match coralandsky.in layout) */}
        <div className="flex md:hidden items-center justify-between px-6 w-full">
          {/* Left: Hamburger Toggle */}
          <div className="w-20 flex justify-start">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`btn-icon focus:outline-none z-50 ${useDarkIcons ? "text-[#2b2622]" : "text-white"}`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Center: Logo */}
          <div className="flex-1 flex justify-center">
            <motion.div 
              className={`text-xl font-bold tracking-tighter uppercase transition-colors duration-500 ${logoColor}`}
            >
              <Link href="/" className="flex items-center gap-2">
                <img 
                  src="/assets/images/raka_favicon.png" 
                  alt="RakaRituals Logo" 
                  className="w-7 h-7 object-contain brightness-110 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                />
                <span>RAKARITUALS</span>
              </Link>
            </motion.div>
          </div>

          {/* Right: Search & Cart Controls */}
          <div className="w-20 flex justify-end items-center gap-4">
            <SearchBar linkColor={linkColor} />
            
            <Link href="/cart" className="btn-icon relative" aria-label="Cart">
              <svg className={linkColor} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FB9E5B] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay (placed outside containing block to fix backdrop-filter layout constraints) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-white z-[48] pt-[84px] pb-14 flex flex-col justify-between overflow-y-auto no-scrollbar"
          >
            {/* Scrollable list of flat menu links */}
            <div className="flex flex-col w-full border-t border-[#e9e9e9]/60 font-sans">
              {[
                { label: "Home", href: "/" },
                { label: "Categories", href: "/categories" },
                { label: "Wishlist", href: "/wishlist" },
                { label: "Profile", href: "/profile" },
                { label: "Orders", href: "/orders" },
                { label: "About", href: "/#about" },
                { label: "Contact", href: "/#contact" }
              ].map((item) => (
                <Link 
                  key={item.label}
                  href={item.href} 
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleLinkClick(e, item.href);
                  }}
                  className="w-full flex items-center justify-between py-[14px] px-6 border-b border-[#e9e9e9]/60 text-[15px] font-medium text-[#151515] hover:bg-neutral-50 transition-colors"
                >
                  <span className="tracking-wide">{item.label}</span>
                  <svg className="w-4 h-4 text-[#151515]/60" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              ))}
            </div>

            {/* Bottom Footer Section: Login / User Details */}
            <div className="border-t border-[#e9e9e9]/80 bg-[#fdfdfd] py-4.5 px-6 flex items-center justify-between mt-auto">
              {user ? (
                <div className="flex items-center gap-3 w-full justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#151515] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="text-sm font-medium text-[#151515] truncate max-w-[200px]">Logged in as <span className="font-semibold">{user.name}</span></span>
                  </div>
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-xs font-black uppercase tracking-widest text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-[15px] font-medium text-[#151515] hover:text-[#FB9E5B] transition-colors"
                >
                  <svg className="w-5 h-5 text-[#151515]" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span>Login</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
