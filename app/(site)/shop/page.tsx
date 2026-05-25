"use client";
import React from "react";
import AllProduct from "@/components/AllProduct";
import Image from "next/image";
import { motion } from "framer-motion";

const ShopPage = () => {
  return (
    <main className="pt-24 min-h-screen bg-[#fdfbf9]">
      {/* Top Banner */}
      <section className="relative w-full overflow-hidden h-[360px] md:h-[450px] flex items-center justify-center">
        <Image
          src="/Img/mockup.webp"
          alt="Shop Our Collection"
          fill
          className="object-cover z-0"
          priority
        />
        {/* Dark overlay with elegant gradient */}
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-black/80 z-10" />
        
        <div className="relative z-20 text-center text-white px-6 max-w-4xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-[#facc15] mb-4 block"
          >
            100% Organic & Raw
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white"
          >
            The Organic Shop
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-lg text-gray-200 font-medium mt-4 max-w-2xl mx-auto leading-relaxed"
          >
            Explore our curated selection of premium dry fruits, artisanal preserves, natural honey, and pure Kashmiri saffron.
          </motion.p>
        </div>
      </section>

      {/* Products Component */}
      <AllProduct showFilter={true} />
    </main>
  );
};

export default ShopPage;
