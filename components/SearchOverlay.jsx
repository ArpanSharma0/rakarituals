"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { searchProducts } from "@/utils/api";

export default function SearchBar({ linkColor }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // Debounced search
  const debouncedSearch = useCallback((searchQuery) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchProducts(searchQuery.trim());
        setResults(data.products || []);
        setHasSearched(true);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleClose = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Search Icon / Toggle */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className={`py-1 transition-colors duration-300 cursor-pointer ${linkColor}`}
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f6a65]/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search products..."
              className="w-[280px] pl-9 pr-3 py-2 bg-white border border-[#e0d8cf] rounded-lg text-sm text-[#2b2622] font-medium outline-none focus:border-[#b89b5e] transition-all placeholder:text-[#6f6a65]/30"
            />
          </div>
          <button
            onClick={handleClose}
            className="text-[#6f6a65] hover:text-[#2b2622] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Results dropdown */}
      {open && (query.trim() || hasSearched) && (
        <div className="absolute right-0 top-full mt-2 w-[340px] bg-white border border-[#e8e1d9] rounded-xl shadow-lg overflow-hidden z-[100]">
          {loading ? (
            <div className="flex items-center gap-3 p-4">
              <div className="w-4 h-4 border-2 border-[#b89b5e] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-[#6f6a65]">Searching...</span>
            </div>
          ) : results.length === 0 && hasSearched ? (
            <div className="p-5 text-center">
              <p className="text-sm text-[#6f6a65]">No products found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="max-h-[380px] overflow-y-auto">
              {results.map((product) => (
                <Link
                  key={product._id}
                  href={`/product/${product._id}`}
                  onClick={handleClose}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf9f6] transition-colors border-b border-[#f2eee9] last:border-b-0"
                >
                  <img
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover bg-[#f7f6f1] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2b2622] truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#6f6a65]/50 uppercase tracking-wider">{product.category}</span>
                      <span className="text-[#6f6a65]/20">·</span>
                      <span className="text-xs font-bold text-[#2b2622]">₹{product.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
