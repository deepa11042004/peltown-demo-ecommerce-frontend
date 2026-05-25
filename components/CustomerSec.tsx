"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";

const testimonials = [
  {
    title: "Great vegan items.",
    content:
      "Imperdiet proin fermentum leo vel orci porta. Ac turpis egestas maecenas pharetra. Vitae aliquet nec ullamcorper sit amet risus nullam eget felis. Nisl rhoncus mattis rhoncus urna.",
    author: "Otto Porter",
  },
  {
    title: "Excellent quality!",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
    author: "Sarah Johnson",
  },
  {
    title: "Fast delivery",
    content:
      "Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis. Donec pretium vulputate sapien nec sagittis aliquam.",
    author: "Michael Chen",
  },
];

const galleryImages = [
  "/Img/gallery1.jpeg",
  "/Img/gallery2.jpeg",
  "/Img/gallery3.jpeg",
  "/Img/gallery4.jpeg",
];

const CustomerSec = () => {
  return (
    <section className="py-20 bg-[#fdfbf9]">
      <div className="max-w-7xl mx-auto px-8">
        {/* 1. Top Visual Gallery (From Image 1) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {galleryImages.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="aspect-square rounded-xl overflow-hidden shadow-sm"
            >
              <div className="relative w-full h-full">
                <Image
                  src={src}
                  alt="Brand lifestyle"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* 2. Heading Section */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-black tracking-tighter text-[#1a1a1a] mb-4"
          >
            Our customers love us
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg font-medium"
          >
            Lectus velum mattis suis amet expertuim...
          </motion.p>
        </div>

        {/* 3. Redesigned Testimonials (From Image 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col"
            >
              {/* Optional: Lucide Quote Icon for a premium touch */}
              <Quote size={24} className="text-[#facc15] mb-4 opacity-50" />

              <h3 className="text-xl font-black text-[#1a1a1a] mb-4 tracking-tight">
                {item.title}
              </h3>

              <p className="text-gray-600 leading-relaxed mb-6 text-sm font-medium">
                {item.content}
              </p>

              <span className="text-sm font-black uppercase tracking-widest text-[#1a1a1a]">
                {item.author}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerSec;
