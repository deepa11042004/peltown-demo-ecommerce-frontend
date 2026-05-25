"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call for password reset request
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#facc15] opacity-5 blur-[120px] -ml-64 -mt-64 rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#242424] rounded-[40px] p-10 shadow-2xl border border-white/5 relative z-10"
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
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Reset Password</h2>
          <p className="text-gray-400 font-medium">We&lsquo;ll send you instructions to reset your password</p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="relative group">
              <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
              <input 
                type="email" 
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold outline-none focus:border-[#facc15]/50 focus:bg-white/10 transition-all"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#facc15] text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-white transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-green-500 text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Email Sent!</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Check your inbox at <span className="text-white font-bold">{email}</span> for instructions to reset your password.
            </p>
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 text-[#facc15] font-black text-xs uppercase tracking-widest hover:text-white transition-colors"
            >
              <FaArrowLeft /> Back to Login
            </Link>
          </motion.div>
        )}

        {!isSubmitted && (
          <div className="text-center mt-10">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#facc15] transition-colors"
            >
              <FaArrowLeft /> Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
