"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Filter,
  Loader2,
  RotateCcw,
  Search,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { adminOrderApi } from "@/lib/api";

type OrderStatusValue =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURN_APPROVED"
  | "RETURN_REJECTED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "FAILED";

type PaymentStatusValue = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

type OrderUser = {
  fullName?: string | null;
  email?: string | null;
};

type OrderItem = {
  id?: number;
  productNameSnapshot?: string | null;
  quantity?: number | null;
};

type OrderAddress = {
  fullName?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  landmark?: string | null;
};

type AdminOrder = {
  id: number;
  orderNumber?: string | null;
  user?: OrderUser | null;
  guestId?: string | null;
  items?: OrderItem[] | null;
  totalAmount?: number | null;
  currency?: string | null;
  paymentStatus?: PaymentStatusValue | string | null;
  orderStatus?: OrderStatusValue | string | null;
  shippingAddress?: OrderAddress | null;
  createdAt?: string | null;
  notes?: string | null;
};

const ORDER_STATUS_OPTIONS: { value: OrderStatusValue; label: string }[] = [
  { value: "PENDING_PAYMENT", label: "Pending Payment" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PACKED", label: "Packed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "RETURN_REQUESTED", label: "Return Requested" },
  { value: "RETURN_APPROVED", label: "Return Approved" },
  { value: "RETURN_REJECTED", label: "Return Rejected" },
  { value: "REFUND_PENDING", label: "Refund Pending" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "FAILED", label: "Failed" },
];

const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING_PAYMENT: "Pending Payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return Requested",
  RETURN_APPROVED: "Return Approved",
  RETURN_REJECTED: "Return Rejected",
  REFUND_PENDING: "Refund Pending",
  REFUNDED: "Refunded",
  FAILED: "Failed",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatusValue, string> = {
  PENDING: "Pending",
  SUCCESS: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const maybeError = error as {
    message?: string;
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  return maybeError.response?.data?.message || maybeError.message || fallback;
};

const formatOrderStatus = (status?: OrderStatusValue | string | null) => {
  if (!status) {
    return "Unknown";
  }

  return ORDER_STATUS_LABELS[status as OrderStatusValue]
    || String(status).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatPaymentStatus = (status?: PaymentStatusValue | string | null) => {
  if (!status) {
    return "Unknown";
  }

  return PAYMENT_STATUS_LABELS[status as PaymentStatusValue]
    || String(status).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount?: number | null, currency?: string | null) => {
  if (amount === null || amount === undefined) {
    return "—";
  }

  const normalizedCurrency = (currency || "INR").toUpperCase();

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${normalizedCurrency}`;
  }
};

const formatItemsSummary = (items?: OrderItem[] | null) => {
  if (!items || items.length === 0) {
    return "No items";
  }

  return items
    .map((item) => `${item.productNameSnapshot || "Item"} (${item.quantity || 0}x)`)
    .join(", ");
};

const formatAddress = (address?: OrderAddress | null) => {
  if (!address) {
    return "Not available";
  }

  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Not available";
};

const mergeOrder = (current: AdminOrder, updated?: AdminOrder | null, nextStatus?: OrderStatusValue) => {
  if (!updated) {
    return {
      ...current,
      orderStatus: nextStatus || current.orderStatus,
    };
  }

  return {
    ...current,
    ...updated,
    user: updated.user || current.user,
    items: updated.items || current.items,
    shippingAddress: updated.shippingAddress || current.shippingAddress,
  };
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatusValue | "All">("All");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await adminOrderApi.list({
          page: 1,
          limit: 100,
          sort: "createdAt_desc",
        });
        const items = (response.data?.data?.items || []) as AdminOrder[];

        if (!mounted) {
          return;
        }

        setOrders(items);
      } catch (requestError: unknown) {
        if (!mounted) {
          return;
        }

        setError(getErrorMessage(requestError, "Failed to load orders"));
        setOrders([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const orderLabel = (order.orderNumber || order.id).toString().toLowerCase();
      const customerName = order.user?.fullName?.toLowerCase() || "guest";
      const customerEmail = order.user?.email?.toLowerCase() || "";
      const guestId = order.guestId?.toLowerCase() || "";

      const matchesSearch =
        !normalizedSearch
        || orderLabel.includes(normalizedSearch)
        || customerName.includes(normalizedSearch)
        || customerEmail.includes(normalizedSearch)
        || guestId.includes(normalizedSearch);

      const matchesStatus = statusFilter === "All" || order.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleStatusChange = async (order: AdminOrder, nextStatus: OrderStatusValue) => {
    if (!order.id || order.orderStatus === nextStatus) {
      return;
    }

    setUpdatingOrderId(order.id);

    try {
      const response = await adminOrderApi.updateStatus(order.id, nextStatus);
      const updated = response.data?.data as AdminOrder | undefined;

      setOrders((previous) =>
        previous.map((entry) =>
          String(entry.id) === String(order.id)
            ? mergeOrder(entry, updated, nextStatus)
            : entry,
        ),
      );
      setSelectedOrder((previous) =>
        previous && String(previous.id) === String(order.id)
          ? mergeOrder(previous, updated, nextStatus)
          : previous,
      );
      toast.success("Order status updated");
    } catch (requestError: unknown) {
      toast.error(getErrorMessage(requestError, "Failed to update order status"));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status?: OrderStatusValue | string | null) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-green-100 text-green-700 border border-green-200">
            <CheckCircle size={12} />
            {formatOrderStatus(status)}
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-blue-100 text-blue-700 border border-blue-200">
            <Clock size={12} />
            {formatOrderStatus(status)}
          </span>
        );
      case "PACKED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-indigo-100 text-indigo-700 border border-indigo-200">
            <ShoppingBag size={12} />
            {formatOrderStatus(status)}
          </span>
        );
      case "PENDING_PAYMENT":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-amber-100 text-amber-700 border border-amber-200">
            <AlertCircle size={12} />
            {formatOrderStatus(status)}
          </span>
        );
      case "OUT_FOR_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-sky-100 text-sky-700 border border-sky-200">
            <Truck size={12} />
            {formatOrderStatus(status)}
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-purple-100 text-purple-700 border border-purple-200">
            <Truck size={12} />
            {formatOrderStatus(status)}
          </span>
        );
      case "RETURN_REQUESTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-amber-100 text-amber-700 border border-amber-200">
            <RotateCcw size={12} />
            {formatOrderStatus(status)}
          </span>
        );
      case "RETURN_APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} />
            {formatOrderStatus(status)}
          </span>
        );
      case "RETURN_REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-rose-100 text-rose-700 border border-rose-200">
            <XCircle size={12} />
            {formatOrderStatus(status)}
          </span>
        );
      case "REFUND_PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-amber-100 text-amber-700 border border-amber-200">
            <Clock size={12} />
            {formatOrderStatus(status)}
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-rose-100 text-rose-700 border border-rose-200">
            <RotateCcw size={12} />
            {formatOrderStatus(status)}
          </span>
        );
      case "FAILED":
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-red-100 text-red-700 border border-red-200">
            <XCircle size={12} />
            {formatOrderStatus(status)}
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} />
            {formatOrderStatus(status)}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-gray-100 text-gray-700 border border-gray-200">
            {formatOrderStatus(status)}
          </span>
        );
    }
  };

  const getPaymentBadge = (status?: PaymentStatusValue | string | null) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-tight bg-emerald-50 text-emerald-600">
            {formatPaymentStatus(status)}
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-tight bg-amber-50 text-amber-600">
            {formatPaymentStatus(status)}
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-tight bg-rose-50 text-rose-600">
            {formatPaymentStatus(status)}
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-tight bg-red-50 text-red-600">
            {formatPaymentStatus(status)}
          </span>
        );
      default:
        return (
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-tight bg-gray-50 text-gray-600">
            {formatPaymentStatus(status)}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Orders</h2>
          <p className="text-gray-500 font-medium text-sm">Manage and monitor customer orders, shipping, and fulfillment.</p>
        </div>
        <button
          onClick={() => alert("Exporting orders report...")}
          className="flex items-center justify-center gap-2 bg-gray-900 text-[#facc15] px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-[#facc15]/20 cursor-pointer"
        >
          <Download size={18} />
          Export Orders
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, customer, or email..."
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#facc15] outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-2xl text-gray-500 font-bold text-xs uppercase tracking-wider shrink-0">
            <Filter size={14} />
            Status:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatusValue | "All")}
            className="w-full md:w-auto bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[#facc15] outline-none cursor-pointer"
          >
            <option value="All">All Orders</option>
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-4xl border border-gray-100 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center gap-3 text-gray-500 font-bold text-sm uppercase tracking-widest">
            <Loader2 size={18} className="animate-spin" /> Loading orders...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-sm font-bold text-red-600">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <ShoppingBag className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-lg font-bold tracking-tight text-gray-800">No orders found</p>
            <p className="text-sm font-medium mt-1">Try adjusting your search query or filter options.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Items</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Total</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Payment</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="font-black text-gray-900 text-sm tracking-tight">
                        #{order.orderNumber || order.id}
                      </span>
                      <span className="block text-xs font-bold text-gray-400 mt-0.5">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-black text-gray-900">{order.user?.fullName || "Guest"}</div>
                      <div className="text-xs font-bold text-gray-400">{order.user?.email || order.guestId || "—"}</div>
                    </td>
                    <td className="px-8 py-5 max-w-xs truncate">
                      <span className="text-sm font-semibold text-gray-700 truncate block">
                        {formatItemsSummary(order.items || [])}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-base font-black text-gray-900">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {getPaymentBadge(order.paymentStatus)}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.orderStatus || "PENDING_PAYMENT"}
                          onChange={(e) => handleStatusChange(order, e.target.value as OrderStatusValue)}
                          disabled={updatingOrderId === order.id}
                          className="bg-transparent font-bold text-xs rounded-lg py-1 px-2 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          {ORDER_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {updatingOrderId === order.id ? (
                          <Loader2 size={14} className="animate-spin text-gray-400" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsViewModalOpen(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-colors cursor-pointer"
                          title="View Order Details"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsViewModalOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 z-50 space-y-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-black uppercase text-gray-900">Order #{selectedOrder.orderNumber || selectedOrder.id}</h3>
                <p className="text-xs font-bold text-gray-400 mt-1">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-sm flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1">Customer Details</span>
                <p className="font-bold text-gray-900">{selectedOrder.user?.fullName || "Guest"}</p>
                <p className="text-gray-500 font-medium">{selectedOrder.user?.email || selectedOrder.guestId || "—"}</p>
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1">Shipping Address</span>
                <p className="text-gray-700 font-medium">{formatAddress(selectedOrder.shippingAddress)}</p>
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1">Items Ordered</span>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <ul className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <li key={item.id ?? item.productNameSnapshot ?? index} className="bg-gray-50 p-3 rounded-xl text-gray-800 font-semibold">
                        {item.productNameSnapshot || "Item"} ({item.quantity || 0}x)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="bg-gray-50 p-3 rounded-xl text-gray-800 font-semibold">No items available</p>
                )}
              </div>

              {selectedOrder.notes ? (
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1">Notes</span>
                  <p className="text-gray-700 font-medium">{selectedOrder.notes}</p>
                </div>
              ) : null}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 font-black text-lg">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-gray-900">{formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500">Status:</span>
                {getStatusBadge(selectedOrder.orderStatus)}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500">Payment:</span>
                {getPaymentBadge(selectedOrder.paymentStatus)}
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="bg-black text-[#facc15] px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-gray-900 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
