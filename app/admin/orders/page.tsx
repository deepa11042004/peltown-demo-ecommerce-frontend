"use client";
import React, { useState } from "react";
import { Search, ShoppingBag, Eye, Trash2, CheckCircle, Clock, AlertCircle, XCircle, Filter, Download } from "lucide-react";

// Initial mock orders data
const initialOrders = [
  {
    id: "ORD-7392",
    customer: "John Doe",
    email: "john.doe@example.com",
    items: "Kashmiri Walnuts (2x), Kashmiri Honey (1x)",
    date: "May 18, 2026",
    total: "₹78.00",
    paymentStatus: "Paid",
    status: "Completed",
    shippingAddress: "123 Maple Street, New York, NY 10001",
  },
  {
    id: "ORD-7391",
    customer: "Jane Smith",
    email: "jane.smith@example.com",
    items: "Kashmiri Almonds (3x)",
    date: "May 17, 2026",
    total: "₹132.00",
    paymentStatus: "Paid",
    status: "Processing",
    shippingAddress: "456 Oak Avenue, Los Angeles, CA 90001",
  },
  {
    id: "ORD-7390",
    customer: "Michael Brown",
    email: "michael.b@example.com",
    items: "Kashmiri Blueberry (1x)",
    date: "May 16, 2026",
    total: "₹36.00",
    paymentStatus: "Pending",
    status: "Pending",
    shippingAddress: "789 Pine Road, Chicago, IL 60007",
  },
  {
    id: "ORD-7389",
    customer: "Sarah Wilson",
    email: "sarah.w@example.com",
    items: "Kashmiri Dry Honey (2x), Kashmiri Walnuts (1x)",
    date: "May 15, 2026",
    total: "₹93.00",
    paymentStatus: "Paid",
    status: "Completed",
    shippingAddress: "321 Cedar Lane, Austin, TX 73301",
  },
  {
    id: "ORD-7388",
    customer: "David Miller",
    email: "david.m@example.com",
    items: "Kashmiri Almonds (1x)",
    date: "May 14, 2026",
    total: "₹44.00",
    paymentStatus: "Refunded",
    status: "Cancelled",
    shippingAddress: "654 Elm Street, Seattle, WA 98101",
  },
  {
    id: "ORD-7387",
    customer: "Emily Davis",
    email: "emily.d@example.com",
    items: "Kashmiri Walnuts (5x)",
    date: "May 12, 2026",
    total: "₹105.00",
    paymentStatus: "Paid",
    status: "Completed",
    shippingAddress: "987 Birch Court, Denver, CO 80201",
  },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<typeof initialOrders[0] | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Filter orders based on search query and selected status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    );
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm(`Are you sure you want to delete order #${orderId}?`)) {
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-green-100 text-green-700 border border-green-200">
            <CheckCircle size={12} />
            Completed
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-blue-100 text-blue-700 border border-blue-200">
            <Clock size={12} />
            Processing
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-amber-100 text-amber-700 border border-amber-200">
            <AlertCircle size={12} />
            Pending
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-red-100 text-red-700 border border-red-200">
            <XCircle size={12} />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-gray-100 text-gray-700 border border-gray-200">
            {status}
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
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[#facc15] outline-none cursor-pointer"
          >
            <option value="All">All Orders</option>
            <option value="Completed">Completed</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-4xl border border-gray-100 shadow-xl overflow-hidden">
        {filteredOrders.length === 0 ? (
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
                      <span className="font-black text-gray-900 text-sm tracking-tight">#{order.id}</span>
                      <span className="block text-xs font-bold text-gray-400 mt-0.5">{order.date}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-black text-gray-900">{order.customer}</div>
                      <div className="text-xs font-bold text-gray-400">{order.email}</div>
                    </td>
                    <td className="px-8 py-5 max-w-xs truncate">
                      <span className="text-sm font-semibold text-gray-700 truncate block">{order.items}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-base font-black text-gray-900">{order.total}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-tight ${
                        order.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-600" :
                        order.paymentStatus === "Pending" ? "bg-amber-50 text-amber-600" :
                        "bg-red-50 text-red-600"
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="bg-transparent font-bold text-xs rounded-lg py-1 px-2 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
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
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 size={18} />
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
                <h3 className="text-xl font-black uppercase text-gray-900">Order #{selectedOrder.id}</h3>
                <p className="text-xs font-bold text-gray-400 mt-1">{selectedOrder.date}</p>
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
                <p className="font-bold text-gray-900">{selectedOrder.customer}</p>
                <p className="text-gray-500 font-medium">{selectedOrder.email}</p>
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1">Shipping Address</span>
                <p className="text-gray-700 font-medium">{selectedOrder.shippingAddress}</p>
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1">Items Ordered</span>
                <p className="bg-gray-50 p-3 rounded-xl text-gray-800 font-semibold">{selectedOrder.items}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 font-black text-lg">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-gray-900">{selectedOrder.total}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Status:</span>
                {getStatusBadge(selectedOrder.status)}
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
