"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaUser, FaArrowRight } from 'react-icons/fa';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await register(formData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#facc15] opacity-5 blur-[120px] -ml-64 -mt-64 rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#facc15] opacity-5 blur-[120px] -mr-64 -mb-64 rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#242424] rounded-[40px] p-10 shadow-2xl border border-white/5 relative z-10"
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
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Create Account</h2>
          <p className="text-gray-400 font-medium">Join the premium nut collection community</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl text-sm font-bold mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative group">
              <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
              <input 
                name="firstName"
                type="text" 
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold outline-none focus:border-[#facc15]/50 focus:bg-white/10 transition-all"
              />
            </div>
            <div className="relative group">
              <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
              <input 
                name="lastName"
                type="text" 
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold outline-none focus:border-[#facc15]/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="relative group">
            <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
            <input 
              name="email"
              type="email" 
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold outline-none focus:border-[#facc15]/50 focus:bg-white/10 transition-all"
            />
          </div>

          <div className="relative group">
            <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
            <input 
              name="password"
              type="password" 
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold outline-none focus:border-[#facc15]/50 focus:bg-white/10 transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#facc15] text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Creating Account...' : (
              <>
                Register Now <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 font-bold text-xs mt-10">
          ALREADY HAVE AN ACCOUNT? {' '}
          <Link href="/login" className="text-[#facc15] hover:text-white transition-colors uppercase tracking-widest ml-1">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
