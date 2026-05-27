/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
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
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { orderApi, paymentApi } from "@/lib/api";
import { loadRazorpayCheckout } from "../../../../lib/razorpay";
import { useAuth } from "@/context/AuthContext";

type OrderAddress = {
  id: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark?: string | null;
};

type OrderItem = {
  id: number;
  productNameSnapshot: string;
  imageSnapshot?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
};

type OrderDetail = {
  id: number;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress?: OrderAddress | null;
  billingAddress?: OrderAddress | null;
  createdAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Payment Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  FAILED: "Failed",
};

const STATUS_STYLES: Record<string, { badge: string; icon: JSX.Element }> = {
  DELIVERED: {
    badge: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle2 size={14} className="text-green-600" />,
  },
  SHIPPED: {
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <Truck size={14} className="text-yellow-600" />,
  },
  PROCESSING: {
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <Package size={14} className="text-yellow-600" />,
  },
  CONFIRMED: {
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <CheckCircle2 size={14} className="text-yellow-600" />,
  },
  PENDING_PAYMENT: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock size={14} className="text-amber-600" />,
  },
  FAILED: {
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: <AlertTriangle size={14} className="text-red-600" />,
  },
  CANCELLED: {
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: <AlertTriangle size={14} className="text-red-600" />,
  },
  REFUNDED: {
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    icon: <AlertTriangle size={14} className="text-gray-600" />,
  },
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMoney = (value: number) => `₹${Number(value || 0).toFixed(2)}`;

const resolveUploadsBaseUrl = () => {
  const explicitBase = process.env.NEXT_PUBLIC_UPLOADS_BASE_URL?.trim();
  if (explicitBase) {
    return explicitBase.replace(/\/+$/, "");
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!apiBase) {
    return "";
  }

  try {
    const parsed = new URL(apiBase);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "";
  }
};

const UPLOADS_BASE_URL = resolveUploadsBaseUrl();

const toSafeImageSrc = (value?: string | null) => {
  const src = String(value || "").trim();

  if (!src) {
    return "/Img/walnuts.jpg";
  }

  if (src.startsWith("/")) {
    if (src.startsWith("/uploads/") && UPLOADS_BASE_URL) {
      return `${UPLOADS_BASE_URL}${src}`;
    }
    return src;
  }

  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:image/")) {
    return src;
  }

  if (src.startsWith("uploads/")) {
    if (UPLOADS_BASE_URL) {
      return `${UPLOADS_BASE_URL}/${src}`;
    }
    return `/${src}`;
  }

  return "/Img/walnuts.jpg";
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const orderIdParam = params?.id;
  const orderId = typeof orderIdParam === "string" ? Number(orderIdParam) : NaN;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);

  const loadOrder = async () => {
    if (!Number.isFinite(orderId)) {
      setLoadingError("Invalid order ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadingError("");

    try {
      const response = await orderApi.getById(orderId);
      const payload = response.data?.data as OrderDetail | undefined;
      if (!payload) {
        throw new Error("Order not found");
      }
      setOrder(payload);
    } catch (error: any) {
      setLoadingError(error.response?.data?.message || error.message || "Unable to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void loadOrder();
    }
  }, [authLoading, isAuthenticated, orderId]);

  const progressIndex = useMemo(() => {
    if (!order?.orderStatus) {
      return 0;
    }

    const map: Record<string, number> = {
      PENDING_PAYMENT: 0,
      CONFIRMED: 1,
      PROCESSING: 2,
      SHIPPED: 3,
      DELIVERED: 4,
    };

    return map[order.orderStatus] ?? 0;
  }, [order?.orderStatus]);

  const timelineSteps = useMemo(() => {
    const steps = [
      "Order Placed",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
    ];

    return steps.map((label, index) => ({
      label,
      done: index <= progressIndex,
    }));
  }, [progressIndex]);

  const statusLabel = order?.orderStatus ? (STATUS_LABELS[order.orderStatus] || order.orderStatus) : "";
  const statusStyle = order?.orderStatus ? STATUS_STYLES[order.orderStatus] : undefined;
  const paymentPending = order?.paymentStatus === "PENDING" || order?.orderStatus === "PENDING_PAYMENT";

  const handleRetryPayment = async () => {
    if (!order) {
      return;
    }

    setIsRetrying(true);
    try {
      const response = await orderApi.retryPayment(order.id);
      const payload = response.data?.data;

      await loadRazorpayCheckout({
        payload,
        customer: {
          name: order.shippingAddress?.fullName,
          contact: order.shippingAddress?.phone,
        },
        onSuccess: async (payment) => {
          await paymentApi.verify({
            orderId: payload.orderId,
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature,
          });
          toast.success("Payment confirmed");
          await loadOrder();
        },
        onFailure: (message) => {
          toast.error(message || "Payment not completed");
        },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Unable to retry payment");
    } finally {
      setIsRetrying(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fdfbf9] pt-36 pb-24 px-4 sm:px-8 flex items-center justify-center">
        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading account...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fdfbf9] pt-36 pb-24 px-4 sm:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-4xl p-10 text-center shadow-xl border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-3">Login required</h2>
          <p className="text-gray-500 font-medium mb-6">Please sign in to view your order.</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#facc15] text-black py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-lg"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfbf9] pt-36 pb-24 px-4 sm:px-8 flex items-center justify-center">
        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fdfbf9] pt-36 pb-24 px-4 sm:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-4xl p-10 text-center shadow-xl border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-3">Order not found</h2>
          <p className="text-gray-500 font-medium mb-6">{loadingError || "Unable to locate this order."}</p>
          <button
            onClick={() => router.push("/profile")}
            className="inline-flex items-center justify-center gap-2 w-full bg-[#facc15] text-black py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-lg"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf9] pt-36 pb-24 px-4 sm:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
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
                  {order.orderNumber}
                </h1>
                {statusStyle && (
                  <span
                    className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 shadow-2xs ${statusStyle.badge}`}
                  >
                    {statusStyle.icon}
                    {statusLabel}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-400 mt-1">
                Placed on {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {paymentPending && (
              <button
                onClick={handleRetryPayment}
                disabled={isRetrying}
                className="px-5 py-2.5 bg-black rounded-full text-xs font-black uppercase tracking-wider text-white hover:bg-[#facc15] hover:text-black transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
              >
                <RotateCcw size={14} /> {isRetrying ? "Retrying..." : "Retry Payment"}
              </button>
            )}
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
              Status: {statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 py-6 relative">
            {timelineSteps.map((step, index) => (
              <div key={step.label} className="flex flex-col items-center text-center relative group">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm z-10 transition-all duration-300 shadow-md ${
                    step.done
                      ? "bg-black text-[#facc15] ring-4 ring-yellow-100"
                      : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {step.done ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <h4 className="font-black text-xs text-gray-900 uppercase mt-3 tracking-tight">
                  {step.label}
                </h4>
                <p className="text-[11px] font-bold text-gray-400 mt-0.5">Step {index + 1}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6"
          >
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-2">
              <FileText size={18} className="text-[#facc15]" /> Ordered Items ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-gray-100">
              {(order.items || []).map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                      <Image
                        src={toSafeImageSrc(item.imageSnapshot)}
                        alt={item.productNameSnapshot}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-sm sm:text-base uppercase tracking-tight">
                        {item.productNameSnapshot}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 mt-1 tracking-wider uppercase">
                        Qty: {item.quantity} × {formatMoney(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#facc15]">
                      {formatMoney(item.totalPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-8"
          >
            <div className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6">
              <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-2">
                <MapPin size={18} className="text-[#facc15]" /> Shipping Details
              </h2>
              {order.shippingAddress ? (
                <div className="space-y-1 text-sm text-gray-700 font-medium">
                  <p className="font-black text-gray-900">{order.shippingAddress.fullName}</p>
                  <p>
                    {[order.shippingAddress.addressLine1, order.shippingAddress.addressLine2]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  <p>
                    {order.shippingAddress.country} {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-xs text-gray-400 pt-2 font-bold">
                    Phone: {order.shippingAddress.phone}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-500">Shipping address unavailable.</p>
              )}

              <div className="border-t border-gray-100 pt-4 space-y-1">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-400">
                  <CreditCard size={14} className="text-gray-900" /> Payment Method
                </div>
                <p className="text-sm font-black text-gray-900">{order.paymentMethod}</p>
                <p className="text-xs text-gray-400 uppercase font-bold">Status: {order.paymentStatus}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-4xl border border-yellow-100 shadow-xl space-y-4 bg-linear-to-br from-white to-yellow-50/20">
              <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 border-b border-gray-100 pb-4">
                Price Summary
              </h2>
              <div className="space-y-2.5 text-sm font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{formatMoney(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-green-600">{formatMoney(order.shippingAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-bold text-gray-900">{formatMoney(order.taxAmount)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-bold text-gray-900">-{formatMoney(order.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-lg font-black text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-2xl text-[#facc15]">{formatMoney(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
