"use client";
import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CheckCircle2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { mockProducts } from "@/lib/mockProducts";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const getProduct = (id: string | number) => {
    const cleanId = String(id).replace("all-", "").replace("prod-", "");
    return mockProducts.find((p) => String(p.id) === cleanId);
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      clearCart();
      setIsCheckingOut(false);
      setOrderPlaced(true);
      toast.success("Order confirmed successfully! 🎉", { duration: 4000 });
    }, 1500);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#fdfbf9] pt-36 pb-24 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[32px] p-10 text-center shadow-2xl border border-yellow-100"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Order Confirmed!</h2>
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            Thank you for your purchase. Your premium organic order is being processed and will be shipped soon.
          </p>
          <Link
            href="/"
            onClick={() => setOrderPlaced(false)}
            className="inline-flex items-center justify-center gap-2 w-full bg-[#facc15] text-black py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-lg"
          >
            <ArrowLeft size={16} /> Return to Shop
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf9] pt-36 pb-24 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight uppercase">
              Shopping Cart
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              You have {itemCount} items in your premium cart
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-sm text-gray-600 hover:text-black transition-colors self-start md:self-auto bg-white border border-gray-200 px-5 py-2.5 rounded-full shadow-sm"
          >
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-[32px] p-16 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto my-12"
            >
              <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#facc15]">
                <ShoppingBag size={48} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Your cart is empty</h2>
              <p className="text-gray-500 max-w-md mx-auto font-medium mb-8">
                Looks like you haven&apos;t added any premium nuts or spices to your cart yet. Explore our top collections!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#facc15] text-black px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-lg"
              >
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <span>Product Details</span>
                    <span className="hidden sm:block">Total</span>
                  </div>

                  <AnimatePresence>
                    {cart.map((item) => {
                      const prod = getProduct(item.id);
                      const isExpanded = expandedId === item.id;
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="py-4 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div
                              onClick={() => setExpandedId(isExpanded ? null : item.id)}
                              className="flex items-center gap-4 flex-1 cursor-pointer group"
                              title="Click to view product description"
                            >
                              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-[#f8f8f8] rounded-2xl overflow-hidden shrink-0 border border-gray-100 shadow-inner group-hover:border-yellow-300 transition-colors">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-black text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 uppercase group-hover:text-yellow-600 transition-colors">
                                    {item.name}
                                  </h3>
                                  <ChevronDown
                                    size={16}
                                    className={`text-gray-400 group-hover:text-yellow-600 transition-transform duration-300 shrink-0 ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </div>
                                <p className="font-bold text-xs sm:text-sm text-[#facc15] mt-1">
                                  ₹{item.price.toFixed(2)}
                                </p>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">
                                  Click to view details
                                </span>

                                {/* Mobile total and quantity controls */}
                                <div className="flex items-center gap-3 mt-3 sm:hidden" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 p-1">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white hover:shadow transition-all"
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white hover:shadow transition-all"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Desktop quantity controls */}
                            <div className="hidden sm:flex items-center gap-6">
                              <div className="flex items-center border-2 border-gray-100 rounded-full bg-gray-50/50 p-1.5 shadow-sm">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-md transition-all font-bold"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-10 text-center text-sm font-black">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-md transition-all font-bold"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              <div className="text-right min-w-[80px]">
                                <p className="font-black text-gray-900 text-lg">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Description Box */}
                          <AnimatePresence>
                            {isExpanded && prod && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden mt-4 bg-yellow-50/50 border border-yellow-100 rounded-2xl p-5 shadow-inner"
                              >
                                <div className="flex items-center justify-between border-b border-yellow-200/60 pb-2.5 mb-3">
                                  <h4 className="font-black text-xs uppercase tracking-wider text-gray-900">
                                    Product Information & Benefits
                                  </h4>
                                  <Link
                                    href={`/product/${prod.id}`}
                                    className="text-xs font-black text-yellow-600 hover:underline uppercase tracking-tight"
                                  >
                                    View Full Page &rarr;
                                  </Link>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                                  {prod.description}
                                </p>
                                {prod.benefits && prod.benefits.length > 0 && (
                                  <div className="mt-3.5 flex flex-wrap gap-2">
                                    {prod.benefits.map((benefit, idx) => (
                                      <span
                                        key={idx}
                                        className="bg-white text-gray-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs border border-gray-100"
                                      >
                                        ✓ {benefit}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <div className="flex justify-between items-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <button
                    onClick={clearCart}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} /> Clear Entire Cart
                  </button>
                  <Link
                    href="/"
                    className="text-xs font-black uppercase tracking-wider text-gray-600 hover:text-black transition-colors"
                  >
                    Add More Items
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-[32px] p-8 shadow-xl border border-yellow-100 space-y-6 sticky top-36">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase border-b border-gray-100 pb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-4 font-medium text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal ({itemCount} items)</span>
                      <span className="font-bold text-gray-900">₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Shipping</span>
                      <span className="font-bold text-green-600">FREE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Tax</span>
                      <span className="font-bold text-gray-900">₹0.00</span>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-lg text-gray-900 font-black">
                      <span>Total Amount</span>
                      <span className="text-2xl text-[#facc15]">₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || cart.length === 0}
                    className="w-full bg-[#facc15] text-black py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all shadow-2xl flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isCheckingOut ? (
                      <span className="animate-pulse">Processing Secure Checkout...</span>
                    ) : (
                      <>
                        <ShoppingBag size={18} /> Proceed to Secure Checkout
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      🔒 Secure Checkout Guaranteed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CartPage;
