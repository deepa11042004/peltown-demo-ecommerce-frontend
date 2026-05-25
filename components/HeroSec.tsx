"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Clock} from "lucide-react";
import Link from "next/link";

const HeroSec = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center">
      {/* Background with subtle zoom animation */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="relative w-full h-full"
        >
          <Image
            src="/Img/hero.webp"
            alt="Hero Background"
            fill
            priority
            className="object-cover"
          />
        </motion.div>
      </div>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black/20 z-10" />

      {/* Content Container */}
      <div className="relative z-20 container mx-auto px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl text-white mx-auto flex flex-col items-center text-center"
        >
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full mb-6 w-fit shadow-lg">
            <Clock size={16} className="text-[#facc15]" />
            <span className="text-xs font-black uppercase tracking-tighter">
              Limited Time Offer
            </span>
          </div>

          <h1 className="text-7xl font-black mb-6 drop-shadow-2xl">
            ADVENTURE <br />
            <span className="text-[#facc15]">AWAITS</span> YOU.
          </h1>

          <p className="text-lg font-medium mb-8 text-gray-100 max-w-md">
            Experience the peak of quality with our new seasonal collection.
            Designed for those who never stop exploring.
          </p>

          <Link href="/shop" className="flex justify-center gap-4">
            <button className="bg-[#facc15] text-black px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors shadow-2xl group">
              Shop Now
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSec;
