"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import AboutNutsSec from "@/components/AboutNuts";
import { ShieldCheck, Leaf, HeartHandshake, Sparkles } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { label: "Founded in Kashmir", value: "1994" },
    { label: "Artisanal Orchards", value: "500+" },
    { label: "100% Organic Products", value: "30+" },
    { label: "Happy Customers Globally", value: "50k+" },
  ];

  const values = [
    {
      icon: <Leaf className="text-[#facc15]" size={28} />,
      title: "100% Organic & Raw",
      desc: "Our nuts and preserves are grown without synthetic fertilizers or pesticides, preserving pure mountain nutrients.",
    },
    {
      icon: <ShieldCheck className="text-[#facc15]" size={28} />,
      title: "Pristine Origin",
      desc: "Sourced directly from the alpine valleys and pristine soil of Pampore and Himalayan highlands.",
    },
    {
      icon: <HeartHandshake className="text-[#facc15]" size={28} />,
      title: "Fair Trade & Community",
      desc: "We partner directly with multi-generational farmer families in Kashmir to ensure ethical and fair wages.",
    },
    {
      icon: <Sparkles className="text-[#facc15]" size={28} />,
      title: "Hand-Sorted Quality",
      desc: "Every kernel and saffron thread is painstakingly handpicked and graded for absolute perfection.",
    },
  ];

  return (
    <main className="pt-24 min-h-screen bg-[#fdfbf9]">
      {/* Top Hero Banner */}
      <section className="relative w-full overflow-hidden h-[380px] md:h-[480px] flex items-center justify-center">
        <Image
          src="/Img/hero.webp"
          alt="Everace Heritage"
          fill
          className="object-cover z-0"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-black/85 z-10" />

        <div className="relative z-20 text-center text-white px-6 max-w-4xl mx-auto space-y-4">
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-[#facc15] block"
          >
            Our Story & Heritage
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white"
          >
            Rooted in Pristine Kashmir
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-lg text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            For over three decades, Everace has been dedicated to cultivating and delivering the finest natural dry fruits, pure saffron, and artisanal honeys from the heights of the Himalayas.
          </motion.p>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-2"
            >
              <div className="text-4xl sm:text-6xl font-black text-[#facc15] tracking-tight">{stat.value}</div>
              <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Two-Column Story Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative aspect-4/3 rounded-4xl overflow-hidden shadow-2xl border border-gray-100"
        >
          <Image src="/Img/gallery1.jpeg" alt="Harvesting in Kashmir" fill className="object-cover" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <span className="bg-black text-[#facc15] font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full">
            Artisanal Excellence
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
            Nurtured by Snow-Fed Glaciers
          </h2>
          <p className="text-gray-600 font-medium leading-relaxed text-base sm:text-lg">
            Our orchards flourish in the unique microclimate of the Kashmir valley. High altitudes, cold mountain air, and mineral-rich glacial waters produce walnuts, almonds, and saffron with a density of nutrients and flavor unmatched anywhere else in the world.
          </p>
          <p className="text-gray-600 font-medium leading-relaxed text-base sm:text-lg">
            We believe that natural food should remain uncorrupted. We do not pasteurize our honey, nor do we bleach our walnuts. Everything reaches your table exactly as nature intended.
          </p>
        </motion.div>
      </section>

      {/* About Nuts Component */}
      <AboutNutsSec />

      {/* Values Grid */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase">Our Core Pillars</h2>
            <p className="text-gray-500 font-medium text-base sm:text-lg">Uncompromising standards that guide every harvest and shipment.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:shadow-xl hover:border-yellow-200 transition-all group"
              >
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {val.icon}
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{val.title}</h3>
                <p className="text-sm font-medium text-gray-500 leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
