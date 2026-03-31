"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(name, email, password);
      router.push("/");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f6f1] px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white p-10 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-[#2b2622]/5"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-[#2b2622] mb-2">Create Account</h1>
          <p className="text-[#6f6a65] text-sm">Begin your journey with RakaRituals</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-semibold rounded-xl text-center uppercase tracking-widest border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#2b2622] mb-2 px-1">Full Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 bg-[#f8f7f4] border border-[#2b2622]/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#b89b5e]/20 focus:border-[#b89b5e] transition-all text-sm"
              placeholder="Your Name"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#2b2622] mb-2 px-1">Email Address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-[#f8f7f4] border border-[#2b2622]/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#b89b5e]/20 focus:border-[#b89b5e] transition-all text-sm"
              placeholder="ritual@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#2b2622] mb-2 px-1">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-[#f8f7f4] border border-[#2b2622]/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#b89b5e]/20 focus:border-[#b89b5e] transition-all text-sm"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl bg-[#2b2622] text-white font-bold uppercase tracking-[0.3em] text-xs shadow-lg shadow-[#2b2622]/10 hover:bg-[#b89b5e] transition-all transform hover:-translate-y-1 mt-4 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? "Creating Journey..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center pt-8 border-t border-[#2b2622]/5">
          <p className="text-[#6f6a65] text-xs">
            Already have an account?{" "}
            <Link href="/login" className="text-[#b89b5e] font-bold uppercase hover:underline">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
