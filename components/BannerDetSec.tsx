"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const BannerDetSec = () => {
  return (
    <section className="relative w-full overflow-hidden min-h-[600px] flex items-center justify-center py-24">
      {/* Background Image */}
      <Image
        src="/Img/mockup.webp"
        alt="Everace Premium Collection"
        fill
        className="object-cover z-0"
        priority
      />
      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      <div className="relative z-20 container mx-auto px-8 text-center text-white">
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto flex flex-col items-center"
        >
          <span className="text-sm md:text-base font-bold uppercase tracking-[0.3em] mb-6 text-yellow-400">
            Premium Handpicked Nuts
          </span>

          <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] uppercase">
            Kashmiri Almonds
          </h2>

          <p className="text-lg md:text-2xl max-w-xl mb-12 leading-relaxed font-medium opacity-90">
            Experience the crunch of nature’s finest selection. Our premium
            Kashmiri almonds are rich in nutrients, packed with flavor, and
            harvested with care to ensure the highest quality for your healthy
            lifestyle.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#facc15] text-black px-12 py-5 rounded-full font-black text-xs md:text-sm uppercase tracking-widest shadow-2xl hover:bg-white transition-all duration-300"
          >
            Explore Collection
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default BannerDetSec;
