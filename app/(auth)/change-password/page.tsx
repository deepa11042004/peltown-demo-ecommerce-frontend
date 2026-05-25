"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { FaLock, FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      setSuccess('Password updated successfully!');
      setTimeout(() => router.push('/'), 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#facc15] opacity-5 blur-[120px] -mr-64 -mt-64 rounded-full" />
      
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
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Security</h2>
          <p className="text-gray-400 font-medium">Update your account password</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl text-sm font-bold mb-6 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-2xl text-sm font-bold mb-6 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative group">
            <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
            <input 
              type="password" 
              placeholder="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold outline-none focus:border-[#facc15]/50 focus:bg-white/10 transition-all"
            />
          </div>

          <div className="relative group">
            <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#facc15] transition-colors" />
            <input 
              type="password" 
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold outline-none focus:border-[#facc15]/50 focus:bg-white/10 transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#facc15] text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Updating...' : (
              <>
                Update Password <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ChangePasswordPage;
