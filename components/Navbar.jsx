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
  
  // Theme state: white for product pages, dynamic for others
  const isWhiteNav = isProductPage || scrolled;
  const linkColor = isWhiteNav ? "text-[#3b2f2f] hover:text-[#2b2622]" : "text-white/80 hover:text-white";
  const logoColor = isWhiteNav ? "text-[#3b2f2f]" : "text-white";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 backdrop-blur-xl ${
        isProductPage 
          ? "bg-white/95 shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-[#2b2622]/5 py-4"
          : scrolled 
            ? "bg-white/80 shadow-[0_1px_20px_rgba(0,0,0,0.02)] border-b border-[#2b2622]/5 py-4" 
            : "bg-transparent border-b border-white/0 py-6"
      }`}
    >
      <div className="ritual-container flex items-center justify-between px-6">
      {/* Left: Logo */}
      <motion.div 
        style={{ opacity: isProductPage ? 1 : navOpacity }}
        className={`text-2xl font-bold tracking-tighter uppercase w-[180px] transition-colors duration-500 ${logoColor}`}
      >
        <Link href="/">RAKARITUALS</Link>
      </motion.div>

      {/* Center: Navigation Links */}
      <div className="hidden md:flex items-center gap-7 text-sm font-medium uppercase tracking-wide">
        {[
          { label: "Home", href: "/" },
          { label: "Products", href: "#products" },
          { label: "About", href: "#about" },
          { label: "Contact", href: "#contact" },
        ].map((item) => (
          <Link 
            key={item.label}
            href={item.href} 
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
          <div className="flex items-center gap-4">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${linkColor}`}>
              {user.name}
            </span>
            <Link 
              href="/profile"
              className={`text-[10px] font-bold uppercase tracking-widest hover:text-[#b89b5e] transition-colors ${linkColor}`}
            >
              Profile
            </Link>
            <Link 
              href="/orders"
              className={`text-[10px] font-bold uppercase tracking-widest hover:text-[#b89b5e] transition-colors ${linkColor}`}
            >
              Orders
            </Link>
            <button 
              onClick={handleLogout}
              className={`text-[10px] font-bold uppercase tracking-widest hover:text-[#b89b5e] transition-colors ${linkColor}`}
            >
              Logout
            </button>
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
