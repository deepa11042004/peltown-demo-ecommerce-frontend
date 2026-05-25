"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaChevronUp,
  FaPaperPlane,
} from "react-icons/fa";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#1a1a1a] text-white pt-20 pb-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        {/* 1. Newsletter Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between pb-16 border-b border-gray-800 mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none">
              Sign up and get{" "}
              <span className="text-[#facc15]">20% discount</span> <br />
              on your next purchase
            </h2>
          </div>

          <div className="w-full lg:w-auto flex items-center bg-white rounded-full p-1 pl-6 shadow-xl max-w-md">
            <input
              type="email"
              placeholder="Enter Your Email"
              className="bg-transparent text-gray-900 w-full outline-none text-sm font-bold"
            />
            <button className="bg-[#facc15] text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 cursor-pointer">
              Submit <FaPaperPlane size={14} />
            </button>
          </div>
        </div>

        {/* 2. Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand & Contact */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="inline-block w-fit cursor-pointer">
              <Image
                src="/Img/logo.webp"
                alt="Everace Logo"
                width={150}
                height={38}
                className="brightness-0 invert hover:opacity-90 transition-opacity"
              />
            </Link>
            <div className="flex flex-col gap-4 text-gray-400 font-medium text-sm"></div>
          </div>

          {/* Menu Column */}
          <div className="flex flex-col gap-6">
            <h4 className="text-lg font-black uppercase tracking-widest text-[#facc15]">
              Menu
            </h4>
            <nav className="flex flex-col gap-3 text-gray-400 font-bold text-sm">
              {["About us", "Landing", "Shop", "Contact", "Blog"].map(
                (link) => (
                  <a
                    key={link}
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                ),
              )}
            </nav>
          </div>

          {/* Categories Column */}
          <div className="flex flex-col gap-6">
            <h4 className="text-lg font-black uppercase tracking-widest text-[#facc15]">
              Categories
            </h4>
            <nav className="flex flex-col gap-3 text-gray-400 font-bold text-sm">
              {["Almonds", "Cashews", "Walnuts", "Pistachios", "Saffron"].map(
                (link) => (
                  <a
                    key={link}
                    href="#"
                    className="hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                ),
              )}
            </nav>
          </div>

          {/* My Account Column */}
          <div className="flex flex-col gap-6">
            <h4 className="text-lg font-black uppercase tracking-widest text-[#facc15]">
              My Account
            </h4>
            <nav className="flex flex-col gap-3 text-gray-400 font-bold text-sm">
              {[
                "Gift Vouchers",
                "Wishlist",
                "Order Tracking",
                "Shopping Cart",
              ].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  {link}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* 3. Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-800">
          <p className="text-xs text-gray-500 font-bold tracking-tight">
            2026, ALL RIGHTS RESERVED
          </p>

          <div className="flex items-center gap-6">
            <FaFacebookF
              size={18}
              className="text-gray-400 hover:text-[#facc15] cursor-pointer transition-colors"
            />
            <FaInstagram
              size={18}
              className="text-gray-400 hover:text-[#facc15] cursor-pointer transition-colors"
            />
            <FaYoutube
              size={18}
              className="text-gray-400 hover:text-[#facc15] cursor-pointer transition-colors"
            />
            <button
              onClick={scrollToTop}
              className="ml-4 bg-[#facc15] text-black p-3 rounded-full hover:bg-white transition-all shadow-lg active:scale-90"
            >
              <FaChevronUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
