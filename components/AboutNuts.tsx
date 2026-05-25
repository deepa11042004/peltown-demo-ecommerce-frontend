"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const nutData = [
  { id: 1, title: "Cashew", color: "bg-[#d1e7d2]" }, // Mint
  { id: 2, title: "Peanut", color: "bg-[#e7decb]" }, // Beige
  { id: 3, title: "Pistachio", color: "bg-[#d1e2e0]" }, // Teal/Blue
  { id: 4, title: "Hazelnut", color: "bg-[#e2d1d4]" }, // Pinkish
  { id: 5, title: "Walnut", color: "bg-[#d1e7d2]" },
  { id: 6, title: "Pecan Nut", color: "bg-[#e7decb]" },
  { id: 7, title: "Almond", color: "bg-[#d1e2e0]" },
  { id: 8, title: "Cola Nut", color: "bg-[#e2d1d4]" },
];

const AboutNutsSec = () => {
  const description = "A lorem doromu suis turpis egestas sad suis";

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-black text-black mb-4 tracking-tighter"
          >
            All about the nuts
          </motion.h2>
          <p className="text-gray-500 font-medium text-lg">
            Turpis egestas sed
          </p>
        </div>

        {/* Redesigned Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8">
          {nutData.map((nut, index) => (
            <motion.div
              key={nut.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center group"
            >
              {/* Circular Background Container */}
              <div
                className={`relative w-48 h-48 rounded-full ${nut.color} flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-6 shadow-sm`}
              >
                {/* Replace <Nut /> with your <img> component 
                  to use the illustrations from your first image 
                */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <Image
                    src={`/Img/About${nut.id}.webp`}
                    alt={nut.title}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Text Content */}
              <h3 className="text-2xl font-black text-black mb-3 tracking-tight">
                {nut.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-[200px] font-medium">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutNutsSec;
