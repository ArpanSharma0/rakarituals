"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { cartItems = [] } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const isProductPage = pathname?.startsWith("/product");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { scrollY } = useScroll();
  const [h, setH] = useState(0);
  useEffect(() => {
    setH(window.innerHeight);
  }, []);

  const navOpacity = useTransform(scrollY, [0.9 * h, 1.1 * h], [0, 1]);
  
  const isHomepage = pathname === "/";
  
  // Theme state: white/opaque for sub-pages or scrolled homepage, transparent for top of homepage
  const isWhiteNav = !isHomepage || isProductPage || scrolled;
  const linkColor = isWhiteNav ? "text-[#3b2f2f] hover:text-[#2b2622]" : "text-white/80 hover:text-white";
  const logoColor = isWhiteNav ? "text-[#3b2f2f]" : "text-white";

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
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 backdrop-blur-xl ${
        isWhiteNav 
          ? "bg-white/95 shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-[#2b2622]/5 py-4"
          : "bg-transparent border-b border-white/0 py-6"
      }`}
    >
      <div className="ritual-container flex items-center justify-between px-6">
      {/* Left: Logo */}
      <motion.div 
        style={{ opacity: isWhiteNav ? 1 : navOpacity }}
        className={`text-2xl font-bold tracking-tighter uppercase w-[180px] transition-colors duration-500 ${logoColor}`}
      >
        <Link href="/">RAKARITUALS</Link>
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

      {/* Right: Login/SignUp & Cart */}
      <div className="hidden md:flex items-center gap-5">
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
      
      <div className="md:hidden">
        <button className={`btn-icon uppercase text-sm font-medium transition-colors ${scrolled ? "text-[#2b2622]" : "text-white"}`}>
          Menu
        </button>
      </div>
      </div>
    </nav>
  );
}
