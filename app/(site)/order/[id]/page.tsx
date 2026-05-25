/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  HelpCircle,
  MapPin,
  CreditCard,
  FileText,
} from "lucide-react";

// Mock detailed data for orders
const mockOrderDetails: Record<string, any> = {
  "ORD-98231": {
    id: "ORD-98231",
    date: "May 15, 2026 at 02:30 PM",
    status: "Delivered",
    trackingNumber: "EVR-98420184920",
    carrier: "BlueDart Express",
    estimatedDelivery: "May 17, 2026",
    items: [
      {
        id: 3,
        name: "Premium Kashmiri Walnuts",
        quantity: 2,
        price: 24.0,
        image: "/Img/walnuts.jpg",
      },
      {
        id: 9,
        name: "Pure Acacia Honey",
        quantity: 1,
        price: 30.0,
        image: "/Img/honey.jpeg",
      },
    ],
    subtotal: 78.0,
    shipping: 0.0,
    tax: 0.0,
    total: 78.0,
    paymentMethod: "Visa ending in 4242",
    shippingAddress: {
      name: "Akash Negi",
      phone: "+91 98765 43210",
      street: "128 Alpine Ridge Boulevard, Pampore Sector 4",
      city: "Kashmir 190001",
    },
    timeline: [
      { step: "Order Placed", date: "May 15, 2026, 02:30 PM", done: true },
      { step: "Processing", date: "May 15, 2026, 06:15 PM", done: true },
      { step: "Shipped", date: "May 16, 2026, 10:00 AM", done: true },
      { step: "Delivered", date: "May 17, 2026, 04:45 PM", done: true },
    ],
  },
  "ORD-87412": {
    id: "ORD-87412",
    date: "May 02, 2026 at 11:15 AM",
    status: "In Transit",
    trackingNumber: "EVR-87419283401",
    carrier: "Delhivery Surface",
    estimatedDelivery: "May 20, 2026",
    items: [
      {
        id: 5,
        name: "Almond Healthy Fat Snack Pack",
        quantity: 1,
        price: 44.0,
        image: "/Img/almonds.jpg",
      },
    ],
    subtotal: 44.0,
    shipping: 0.0,
    tax: 0.0,
    total: 44.0,
    paymentMethod: "Mastercard ending in 8821",
    shippingAddress: {
      name: "Akash Negi",
      phone: "+91 98765 43210",
      street: "128 Alpine Ridge Boulevard, Pampore Sector 4",
      city: "Kashmir 190001",
    },
    timeline: [
      { step: "Order Placed", date: "May 02, 2026, 11:15 AM", done: true },
      { step: "Processing", date: "May 03, 2026, 09:00 AM", done: true },
      { step: "Shipped", date: "May 04, 2026, 02:30 PM", done: true },
      { step: "Out for Delivery", date: "Estimated May 20", done: false },
    ],
  },
  "ORD-75622": {
    id: "ORD-75622",
    date: "Apr 18, 2026 at 09:45 AM",
    status: "Delivered",
    trackingNumber: "EVR-75629102938",
    carrier: "Amazon Shipping",
    estimatedDelivery: "Apr 21, 2026",
    items: [
      {
        id: 6,
        name: "Dried Saffron Berries",
        quantity: 1,
        price: 52.0,
        image: "/Img/honey.jpeg",
      },
    ],
    subtotal: 52.0,
    shipping: 0.0,
    tax: 0.0,
    total: 52.0,
    paymentMethod: "UPI / Net Banking",
    shippingAddress: {
      name: "Akash Negi",
      phone: "+91 98765 43210",
      street: "128 Alpine Ridge Boulevard, Pampore Sector 4",
      city: "Kashmir 190001",
    },
    timeline: [
      { step: "Order Placed", date: "Apr 18, 2026, 09:45 AM", done: true },
      { step: "Processing", date: "Apr 18, 2026, 03:00 PM", done: true },
      { step: "Shipped", date: "Apr 19, 2026, 11:30 AM", done: true },
      { step: "Delivered", date: "Apr 21, 2026, 01:15 PM", done: true },
    ],
  },
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = typeof params?.id === "string" ? params.id : "ORD-98231";

  // Default to ORD-98231 if not found
  const order = mockOrderDetails[orderId] || mockOrderDetails["ORD-98231"];

  return (
    <div className="min-h-screen bg-[#fdfbf9] pt-36 pb-24 px-4 sm:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="p-3 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-black hover:border-black transition-colors shadow-xs"
              title="Back to Profile"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-4xl font-black text-gray-900 uppercase tracking-tight">
                  {order.id}
                </h1>
                <span
                  className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 shadow-2xs ${
                    order.status === "Delivered"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  }`}
                >
                  {order.status === "Delivered" ? (
                    <CheckCircle2 size={14} className="text-green-600" />
                  ) : (
                    <Truck size={14} className="text-yellow-600" />
                  )}
                  {order.status}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-400 mt-1">
                Placed on {order.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-xs font-black uppercase tracking-wider text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <Download size={14} /> Download Invoice
            </button>
            <Link
              href="/contact"
              className="px-5 py-2.5 bg-[#facc15] rounded-full text-xs font-black uppercase tracking-wider text-black hover:bg-black hover:text-white transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              <HelpCircle size={14} /> Need Help
            </Link>
          </div>
        </div>

        {/* Timeline Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 flex items-center gap-2">
              <Package size={18} className="text-[#facc15]" /> Shipment Progress
            </h2>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase">
              {order.carrier} • {order.trackingNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-6 relative">
            {order.timeline.map((item: any, index: number) => (
              <div key={index} className="flex flex-col items-center text-center relative group">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm z-10 transition-all duration-300 shadow-md ${
                    item.done
                      ? "bg-black text-[#facc15] ring-4 ring-yellow-100"
                      : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {item.done ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <h4 className="font-black text-sm text-gray-900 uppercase mt-3 tracking-tight">
                  {item.step}
                </h4>
                <p className="text-[11px] font-bold text-gray-400 mt-0.5 max-w-[120px]">
                  {item.date}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Details Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6"
          >
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-2">
              <FileText size={18} className="text-[#facc15]" /> Ordered Items ({order.items.length})
            </h2>

            <div className="divide-y divide-gray-100">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-sm sm:text-base uppercase tracking-tight">
                        {item.name}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 mt-1 tracking-wider uppercase">
                        Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#facc15]">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sidebar Info & Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-8"
          >
            {/* Delivery Info */}
            <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6">
              <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-2">
                <MapPin size={18} className="text-[#facc15]" /> Shipping Details
              </h2>
              <div className="space-y-1 text-sm text-gray-700 font-medium">
                <p className="font-black text-gray-900">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}</p>
                <p className="text-xs text-gray-400 pt-2 font-bold">Phone: {order.shippingAddress.phone}</p>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-1">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
                  <CreditCard size={14} className="text-gray-900" /> Payment Method
                </div>
                <p className="text-sm font-black text-gray-900">{order.paymentMethod}</p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white p-8 rounded-4xl border border-yellow-100 shadow-xl space-y-4 bg-linear-to-br from-white to-yellow-50/20">
              <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 border-b border-gray-100 pb-4">
                Price Summary
              </h2>
              <div className="space-y-2.5 text-sm font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="font-bold text-gray-900">₹{order.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-lg font-black text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-2xl text-[#facc15]">₹{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
