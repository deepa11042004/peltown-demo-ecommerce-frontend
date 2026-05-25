"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist, wishlistCount } =
    useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-[#fdfbf9] pt-36 pb-24 px-4 sm:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Navigation & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-3">
              <Heart className="text-red-500 fill-red-500" size={36} /> My
              Wishlist
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              {wishlistCount === 0
                ? "No items in your wishlist"
                : `You have ${wishlistCount} premium items saved`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {wishlistCount > 0 && (
              <button
                onClick={clearWishlist}
                className="px-5 py-2.5 bg-red-50 border border-red-200 rounded-full text-xs font-black uppercase tracking-wider text-red-600 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <Trash2 size={14} /> Clear Wishlist
              </button>
            )}
            <Link
              href="/shop"
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-xs font-black uppercase tracking-wider text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <ArrowLeft size={14} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Wishlist Grid / Empty State */}
        <AnimatePresence mode="wait">
          {wishlist.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-[32px] p-16 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto my-12"
            >
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <Heart size={48} className="fill-red-500/20" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight uppercase">
                Your Wishlist is Empty
              </h2>
              <p className="text-gray-500 max-w-md mx-auto font-medium mb-8">
                Explore our shop and tap the heart icon on your favorite items
                to save them for later!
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-[#facc15] text-black px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-lg"
              >
                <ShoppingBag size={16} /> Discover Products
              </Link>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              <AnimatePresence>
                {wishlist.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="group bg-white rounded-[32px] p-5 flex flex-col items-center text-center shadow-sm border border-gray-100 hover:border-yellow-200 hover:shadow-xl transition-all duration-300 relative select-none"
                  >
                    {/* Delete Action (Top Right) */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute right-4 top-4 w-8 h-8 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-full flex items-center justify-center transition-all z-10 shadow-xs cursor-pointer"
                      title="Remove from Wishlist"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Image Container */}
                    <div className="relative w-full aspect-square bg-[#f8f8f8] rounded-[24px] overflow-hidden mb-6 flex items-center justify-center">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-xl font-black text-gray-900">
                        ₹{item.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-gray-800 mb-6 h-10 line-clamp-2 px-2 leading-tight uppercase tracking-tight">
                      {item.name}
                    </h3>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() =>
                        addToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                        })
                      }
                      className="w-full py-3.5 bg-[#facc15] hover:bg-black text-black hover:text-[#facc15] rounded-full font-black text-[11px] uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
