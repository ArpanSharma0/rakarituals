"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || user.isAdmin === false) {
        // Assume user object has isAdmin if available, but prompt says if (!token) redirect("/")
        // Given the instructions, we can assume a token existence check is primary.
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
        } else {
          setIsAuthorized(true);
        }
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router]);

  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  if (loading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f6f1]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#e8e1d9] border-t-[#b89b5e] rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2b2622]/40 animate-pulse">Authenticating Presence...</p>
        </div>
      </div>
    );
  }

  const NavLink = ({ href, children }) => (
    <Link 
      href={href} 
      className={`px-6 py-4 rounded-2xl transition-all font-bold text-sm flex items-center gap-4 group ${
        isActive(href) 
        ? "bg-[#2b2622] text-white shadow-lg -translate-x-2" 
        : "text-[#6f6a65] hover:bg-[#f7f6f1] hover:text-[#2b2622]"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full transition-all ${isActive(href) ? "bg-[#b89b5e] scale-150" : "bg-transparent group-hover:bg-[#b89b5e]"}`}></span>
      {children}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#f7f6f1] flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-[20%] bg-[#e8e1d9] p-8 flex flex-col gap-10 border-r border-[#dcd4cb] sticky top-0 h-screen overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-[#2b2622] tracking-tighter leading-none">Raka<br/>Rituals</h2>
          <p className="text-[10px] text-[#6f6a65] uppercase font-black tracking-[0.3em] mt-4 bg-[#dcd4cb] inline-block px-3 py-1 rounded-full">Admin Elite</p>
        </div>
        
        <nav className="flex flex-col gap-2">
          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/products">Products</NavLink>
          <NavLink href="/admin/create-product">Add Ritual</NavLink>
          
          <div className="px-6 py-4 rounded-2xl opacity-20 cursor-not-allowed text-[#6f6a65] font-bold text-sm flex items-center gap-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6f6a65]"></span>
            Orders (Soon)
          </div>
          
          <div className="mt-12 pt-8 border-t border-[#dcd4cb]">
            <Link 
              href="/" 
              className="px-6 py-3 rounded-xl hover:bg-[#f7f6f1] transition-all text-[#6f6a65] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 opacity-60 hover:opacity-100"
            >
              ← Back to Temple
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="w-full md:w-[80%] p-8 md:p-14 overflow-y-auto bg-stone-50/30">
        {children}
      </main>
    </div>
  );
}
