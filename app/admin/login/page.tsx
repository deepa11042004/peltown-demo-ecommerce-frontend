/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowRight, FaEnvelope, FaLock, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

const isAdminRole = (role?: string | null) => {
  if (!role) {
    return false;
  }

  const normalizedRole = role.toLowerCase();
  return normalizedRole === "admin" || normalizedRole === "super_admin";
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { loginAdmin, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && isAdminRole(user.role)) {
      router.replace("/admin");
    }
  }, [loading, router, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await loginAdmin({ email, password });
    } catch (err: any) {
      setError(err || "Admin login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-105 h-105 bg-red-500 opacity-10 blur-[120px] -ml-56 -mt-56 rounded-full" />
      <div className="absolute bottom-0 right-0 w-105 h-105 bg-[#facc15] opacity-10 blur-[120px] -mr-56 -mb-56 rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#242424] rounded-4xl p-10 shadow-2xl border border-white/10 relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6 cursor-pointer">
            <Image
              src="/Img/logo.webp"
              alt="Everace Logo"
              width={150}
              height={38}
              className="brightness-0 invert hover:opacity-90 transition-opacity"
              priority
            />
          </Link>
          <div className="w-14 h-14 rounded-2xl bg-[#facc15]/15 border border-[#facc15]/30 text-[#facc15] flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt size={24} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Admin Panel Login</h1>
          <p className="text-sm text-gray-400 font-medium">Only admin and super admin accounts can continue.</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm font-bold mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative group">
            <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Admin Email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold outline-none focus:border-[#facc15]/50 focus:bg-white/10 transition-all"
            />
          </div>

          <div className="relative group">
            <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold outline-none focus:border-[#facc15]/50 focus:bg-white/10 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#facc15] text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? (
              "Signing in..."
            ) : (
              <>
                Enter Admin Panel <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500 font-bold uppercase tracking-widest">
          Looking for customer login?{" "}
          <Link href="/login" className="text-[#facc15] hover:text-white transition-colors">
            Go to User Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
