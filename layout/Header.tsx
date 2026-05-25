"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  User,
  ShoppingBasket,
  ChevronDown,
  Phone,
  Menu,
  X,
  Heart,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaStar,
  FaSignOutAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";
interface NavItem {
  name: string;
  href: string;
  hasDropdown: boolean;
  isMega?: boolean;
  subItems?: string[];
  megaMenu?: { title: string; items: string[] }[];
}

const navItems: NavItem[] = [
  {
    name: "Home",
    href: "/",
    hasDropdown: false,
  },
  {
    name: "About us",
    href: "/about",
    hasDropdown: false,
  },
  {
    name: "Bestseller",
    href: "/bestseller",
    hasDropdown: false,
  },
  {
    name: "Shop",
    href: "/shop",
    hasDropdown: false,
  },

  {
    name: "Contact us",
    href: "/contact",
    hasDropdown: false,
  },
];

const Header = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(
    null,
  );
  const { user, logout, isAuthenticated } = useAuth();
  const { cartTotal, itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      <header className="w-full font-sans absolute top-0 left-0 z-50 bg-white/90 backdrop-blur-md border-b border-white/20 shadow-xs">
        {/* Top Announcement Bar */}
        <div className="bg-[#facc15] py-2 px-4 sm:px-6 flex justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black">
          <div className="flex gap-3 sm:gap-4">
            <FaFacebookF
              size={14}
              className="cursor-pointer hover:opacity-70 transition-opacity"
            />
            <FaInstagram
              size={14}
              className="cursor-pointer hover:opacity-70 transition-opacity"
            />
            <FaLinkedinIn
              size={14}
              className="cursor-pointer hover:opacity-70 transition-opacity"
            />
            <FaYoutube
              size={14}
              className="cursor-pointer hover:opacity-70 transition-opacity"
            />
          </div>
          <p className="truncate text-center">
            Free shipping for orders over ₹2000
          </p>
          <div className="hidden md:block w-20"></div>
        </div>

        {/* Main Navigation Row */}
        <div className="py-3.5 px-4 sm:px-8 flex justify-between items-center border-b border-gray-100 gap-4">
          {/* Left: Mobile Menu Toggle & Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-800 hover:text-yellow-600 rounded-lg hover:bg-gray-100 transition-colors lg:hidden cursor-pointer shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="cursor-pointer inline-block shrink-0">
              <Image
                src="/Img/logo.webp"
                alt="Everace Logo"
                width={130}
                height={32}
                className="object-contain sm:w-[140px] sm:h-[35px]"
                priority
              />
            </Link>
          </div>

          {/* Links with Subtabs (Desktop Only) */}
          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-bold text-gray-800 uppercase tracking-tight relative">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative group h-full py-2 cursor-pointer"
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 transition-colors duration-300 ${
                    hoveredItem === item.name || isActive(item)
                      ? "text-yellow-600"
                      : "text-gray-800"
                  }`}
                >
                  {item.name}
                  {item.name === "Shop" && (
                    <FaStar size={12} className="text-[#facc15]" />
                  )}
                  {item.hasDropdown && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${hoveredItem === item.name ? "rotate-180" : ""}`}
                    />
                  )}
                </Link>

                {/* Active Indicator */}
                {isActive(item) && (
                  <div className="absolute bottom-1 left-0 w-full h-0.5 bg-yellow-500" />
                )}

                {/* Dropdowns */}
                <AnimatePresence>
                  {hoveredItem === item.name && item.hasDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute top-full left-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-sm overflow-hidden z-60 ${
                        item.isMega
                          ? "fixed left-0 right-0 mx-auto w-[90vw] max-w-7xl px-12 py-10 grid grid-cols-3 gap-12"
                          : "w-56 py-2"
                      }`}
                    >
                      {!item.isMega
                        ? item.subItems?.map((sub) => (
                            <a
                              key={sub}
                              href="#"
                              className="block px-6 py-3 text-[12px] text-gray-600 hover:text-yellow-600 hover:bg-green-50/50 transition-all duration-200"
                            >
                              {sub}
                            </a>
                          ))
                        : item.megaMenu?.map((section) => (
                            <div
                              key={section.title}
                              className="flex flex-col gap-6"
                            >
                              <h3 className="text-[14px] font-black border-b border-gray-100 pb-3 mb-2">
                                {section.title}
                              </h3>
                              <div className="flex flex-col gap-3">
                                {section.items.map((sub) => (
                                  <a
                                    key={sub}
                                    href="#"
                                    className="text-[12px] font-bold text-gray-500 hover:text-yellow-600 transition-colors"
                                  >
                                    {sub}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right: Phone, Auth & Cart Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden xl:flex items-center gap-2 text-xs md:text-sm font-semibold text-gray-500 mr-2 border-r pr-4">
              <Phone size={14} className="text-yellow-500" />{" "}
              <span>+91 1111111111</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/profile"
                  className="flex items-center justify-center sm:gap-2 border-2 border-yellow-100 w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full text-xs font-bold bg-yellow-50/50 hover:bg-yellow-100/80 transition-colors cursor-pointer"
                  title={user?.firstName || "Profile"}
                >
                  <User size={16} className="text-yellow-600 shrink-0" />
                  <span className="hidden sm:inline uppercase text-xs truncate max-w-[120px]">
                    {user?.firstName || "ADMIN"}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 sm:p-2.5 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-all group cursor-pointer"
                  title="Logout"
                >
                  <FaSignOutAlt
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center sm:gap-2 border-2 border-gray-100 w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
                title="Account"
              >
                <User size={16} className="shrink-0" />
                <span className="hidden sm:inline uppercase text-xs">
                  ACCOUNT
                </span>
              </Link>
            )}

            <Link
              href="/wishlist"
              className="flex items-center justify-center border-2 border-gray-100 w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-full text-xs font-bold hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition cursor-pointer relative"
              title="Wishlist"
            >
              <Heart size={16} className="shrink-0 text-red-500 fill-red-500" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="flex items-center justify-center sm:gap-2 bg-[#facc15] w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full text-xs font-black shadow-md hover:bg-black hover:text-white transition-all duration-300 cursor-pointer relative"
              title="View Cart"
            >
              <ShoppingBasket
                size={16}
                className="shrink-0 text-black sm:text-inherit"
              />
              <span className="hidden sm:inline">
                RS. {cartTotal.toFixed(2)} ({itemCount})
              </span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-[#facc15] text-[10px] w-4 h-4 rounded-full flex items-center justify-center sm:hidden font-black">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu & Backdrop (Placed OUTSIDE header so backdrop filter doesn't trap fixed positioning) */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-60 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-70 w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col lg:hidden transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <Image
              src="/Img/logo.webp"
              alt="Everace Logo"
              width={130}
              height={32}
              priority
            />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close Mobile Menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-6 space-y-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <div key={item.name} className="border-b border-gray-50 pb-2">
                <div
                  onClick={() => {
                    if (item.hasDropdown) {
                      setExpandedMobileItem(
                        expandedMobileItem === item.name ? null : item.name,
                      );
                    } else {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className="flex items-center justify-between py-2.5 text-sm font-black text-gray-900 uppercase tracking-tight cursor-pointer hover:text-yellow-600 transition-colors"
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={
                      isActive(item)
                        ? "text-yellow-600 flex items-center gap-1.5"
                        : "text-gray-900 flex items-center gap-1.5"
                    }
                  >
                    {item.name}
                    {item.name === "Shop" && (
                      <FaStar size={12} className="text-[#facc15]" />
                    )}
                  </Link>
                  {item.hasDropdown && (
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-200 ${
                        expandedMobileItem === item.name
                          ? "rotate-180 text-yellow-600"
                          : ""
                      }`}
                    />
                  )}
                </div>

                {/* Sub-items list */}
                {expandedMobileItem === item.name && item.hasDropdown && (
                  <div className="pl-4 pt-1 pb-2 space-y-2.5 border-l-2 border-yellow-400/30 ml-2">
                    {!item.isMega
                      ? item.subItems?.map((sub) => (
                          <a
                            key={sub}
                            href="#"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-xs font-bold text-gray-500 hover:text-yellow-600 py-1 transition-colors uppercase"
                          >
                            {sub}
                          </a>
                        ))
                      : item.megaMenu?.map((section) => (
                          <div key={section.title} className="space-y-1.5 pt-2">
                            <p className="text-[11px] font-black uppercase text-gray-900">
                              {section.title}
                            </p>
                            <div className="pl-2 space-y-1.5">
                              {section.items.map((sub) => (
                                <a
                                  key={sub}
                                  href="#"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="block text-xs font-bold text-gray-500 hover:text-yellow-600 py-1 transition-colors uppercase"
                                >
                                  {sub}
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
          <div className="flex items-center gap-3 text-xs font-bold text-gray-700">
            <Phone size={16} className="text-yellow-500" />
            <span>+91 1111111111</span>
          </div>
          <div className="flex gap-4 pt-2">
            <FaFacebookF
              size={16}
              className="text-gray-600 hover:text-yellow-600 cursor-pointer transition-colors"
            />
            <FaInstagram
              size={16}
              className="text-gray-600 hover:text-yellow-600 cursor-pointer transition-colors"
            />
            <FaLinkedinIn
              size={16}
              className="text-gray-600 hover:text-yellow-600 cursor-pointer transition-colors"
            />
            <FaYoutube
              size={16}
              className="text-gray-600 hover:text-yellow-600 cursor-pointer transition-colors"
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Header;
