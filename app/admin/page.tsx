"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { adminOrderApi } from "@/lib/api";

type DashboardOrder = {
  id: number;
  orderNumber?: string | null;
  user?: {
    fullName?: string | null;
  } | null;
  guestId?: string | null;
  totalAmount?: number | null;
  currency?: string | null;
  orderStatus?: string | null;
  createdAt?: string | null;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const formatCurrency = (amount?: number | null, currency = "INR") => {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatOrderStatus = (status?: string | null) => {
  if (!status) {
    return "Unknown";
  }

  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getOrderStatusClasses = (status?: string | null) => {
  const normalizedStatus = status?.toUpperCase();

  if (normalizedStatus === "DELIVERED" || normalizedStatus === "SUCCESS") {
    return "bg-green-100 text-green-700";
  }

  if (["PROCESSING", "CONFIRMED", "PACKED"].includes(normalizedStatus || "")) {
    return "bg-blue-100 text-blue-700";
  }

  if (["SHIPPED", "OUT_FOR_DELIVERY"].includes(normalizedStatus || "")) {
    return "bg-sky-100 text-sky-700";
  }

  if (["RETURN_REQUESTED", "REFUND_PENDING"].includes(normalizedStatus || "")) {
    return "bg-amber-100 text-amber-700";
  }

  if (["CANCELLED", "FAILED", "REFUNDED", "RETURN_REJECTED"].includes(normalizedStatus || "")) {
    return "bg-red-100 text-red-700";
  }

  if (normalizedStatus === "RETURN_APPROVED") {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-yellow-100 text-yellow-700";
};

const extractOrders = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return payload as DashboardOrder[];
  }

  if (payload && typeof payload === "object") {
    const maybeData = payload as {
      data?: {
        items?: DashboardOrder[];
      } | DashboardOrder[];
      items?: DashboardOrder[];
    };

    if (Array.isArray(maybeData.data)) {
      return maybeData.data;
    }

    if (Array.isArray(maybeData.data?.items)) {
      return maybeData.data.items;
    }

    if (Array.isArray(maybeData.items)) {
      return maybeData.items;
    }
  }

  return [] as DashboardOrder[];
};

export default function AdminDashboard() {
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const stats = [
    { title: "Total Sales", value: "₹24,500", icon: <TrendingUp size={24} />, trend: "+12%" },
    { title: "Active Users", value: "1,250", icon: <Users size={24} />, trend: "+5%" },
    { title: "Total Products", value: "85", icon: <Package size={24} />, trend: "0%" },
    { title: "New Orders", value: "32", icon: <ShoppingBag size={24} />, trend: "+25%" },
  ];

  useEffect(() => {
    let mounted = true;

    const loadRecentOrders = async () => {
      setLoadingOrders(true);
      setOrdersError("");

      try {
        const response = await adminOrderApi.list({
          page: 1,
          limit: 4,
          sort: "createdAt_desc",
        });

        if (!mounted) {
          return;
        }

        setRecentOrders(extractOrders(response.data));
      } catch (error) {
        if (!mounted) {
          return;
        }

        setOrdersError(error instanceof Error ? error.message : "Failed to load recent orders");
        setRecentOrders([]);
      } finally {
        if (mounted) {
          setLoadingOrders(false);
        }
      }
    };

    loadRecentOrders();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
              <p className={`text-xs font-bold mt-2 ${stat.trend.startsWith("+") ? "text-green-600" : "text-gray-400"}`}>
                {stat.trend} from last month
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-gray-700">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm font-bold text-[#facc15] bg-black px-3 py-1.5 rounded-lg hover:bg-gray-900 transition-colors">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingOrders ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm font-medium text-gray-500">
                      Loading recent orders...
                    </td>
                  </tr>
                ) : ordersError ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm font-medium text-red-600">
                      {ordersError}
                    </td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm font-medium text-gray-500">
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-medium">{order.orderNumber || `#${order.id}`}</td>
                      <td className="py-4 text-gray-600">{order.user?.fullName || "Guest"}</td>
                      <td className="py-4 text-gray-500">{formatDate(order.createdAt)}</td>
                      <td className="py-4 font-semibold">{formatCurrency(order.totalAmount, order.currency || "INR")}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getOrderStatusClasses(order.orderStatus)}`}>
                          {formatOrderStatus(order.orderStatus)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/admin/products/add" className="w-full py-3 px-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors text-left flex justify-between items-center cursor-pointer">
              Add New Product
              <Package size={16} />
            </Link>
            <Link href="/admin/orders" className="w-full py-3 px-4 bg-[#facc15] text-black font-black rounded-xl text-sm hover:bg-[#facc15]/90 transition-colors text-left flex justify-between items-center cursor-pointer shadow-sm">
              Manage Orders
              <ShoppingBag size={16} />
            </Link>
            <Link href="/admin/users" className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors text-left flex justify-between items-center cursor-pointer">
              Manage Users
              <Users size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
