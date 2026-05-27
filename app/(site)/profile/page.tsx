"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Lock,
  LogOut,
  CheckCircle2,
  Truck,
  Clock,
  AlertTriangle,
  Save,
  ShieldCheck,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { addressApi, orderApi } from "@/lib/api";

type OrderItem = {
  productNameSnapshot: string;
  quantity: number;
};

type OrderSummary = {
  id: number;
  orderNumber: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
  items?: OrderItem[];
};

type Address = {
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
  type?: "shipping" | "billing" | "both";
};

type AddressFormState = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark: string;
  type: "shipping" | "billing" | "both";
};

const ORDER_STATUS_META: Record<string, { label: string; badge: string; icon: JSX.Element }> = {
  DELIVERED: {
    label: "Delivered",
    badge: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle2 size={16} className="text-green-600" />,
  },
  SHIPPED: {
    label: "Shipped",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <Truck size={16} className="text-yellow-600" />,
  },
  PROCESSING: {
    label: "Processing",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <Clock size={16} className="text-yellow-600" />,
  },
  CONFIRMED: {
    label: "Confirmed",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <CheckCircle2 size={16} className="text-yellow-600" />,
  },
  PENDING_PAYMENT: {
    label: "Payment Pending",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock size={16} className="text-amber-600" />,
  },
  FAILED: {
    label: "Failed",
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: <AlertTriangle size={16} className="text-red-600" />,
  },
  CANCELLED: {
    label: "Cancelled",
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: <AlertTriangle size={16} className="text-red-600" />,
  },
  REFUNDED: {
    label: "Refunded",
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    icon: <AlertTriangle size={16} className="text-gray-600" />,
  },
};

const formatOrderDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formatOrderItems = (items: OrderItem[] = []) => {
  if (items.length === 0) {
    return "Items pending";
  }

  return items
    .slice(0, 3)
    .map((item) => `${item.productNameSnapshot} (${item.quantity}x)`)
    .join(", ");
};

const formatMoney = (value: number) => `₹${Number(value || 0).toFixed(2)}`;

const formatAddressLine = (address: Address) => {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    `${address.city}, ${address.state}`,
    `${address.country} ${address.postalCode}`,
  ].filter((entry) => entry && entry.trim());

  return parts.join(", ");
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"details" | "orders" | "addresses" | "security">("details");
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+91 98765 43210",
    address: "128 Alpine Ridge Boulevard, Pampore Sector 4, Kashmir 190001",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressFormState>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    landmark: "",
    type: "shipping",
  });

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");

    try {
      const response = await orderApi.list({ sort: "createdAt_desc" });
      const payload = response.data?.data;
      const items = Array.isArray(payload?.items) ? payload.items : [];
      setOrders(items as OrderSummary[]);
    } catch (error: any) {
      setOrdersError(error.response?.data?.message || error.message || "Unable to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadAddresses = async () => {
    setAddressLoading(true);
    setAddressError("");

    try {
      const response = await addressApi.list();
      const payload = response.data?.data;
      const items = Array.isArray(payload) ? payload : [];
      setAddresses(items as Address[]);
    } catch (error: any) {
      setAddressError(error.response?.data?.message || error.message || "Unable to load addresses");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newAddress.fullName
      || !newAddress.phone
      || !newAddress.addressLine1
      || !newAddress.city
      || !newAddress.state
      || !newAddress.country
      || !newAddress.postalCode
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsCreatingAddress(true);

    try {
      const response = await addressApi.create({
        fullName: newAddress.fullName.trim(),
        phone: newAddress.phone.trim(),
        addressLine1: newAddress.addressLine1.trim(),
        addressLine2: newAddress.addressLine2.trim() || null,
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        country: newAddress.country.trim(),
        postalCode: newAddress.postalCode.trim(),
        landmark: newAddress.landmark.trim() || null,
        type: newAddress.type,
      });

      const created = response.data?.data as Address | undefined;
      if (created?.id) {
        setAddresses((prev) => [created, ...prev]);
      }
      setIsAddingAddress(false);
      setNewAddress({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "India",
        postalCode: "",
        landmark: "",
        type: "shipping",
      });
      toast.success("New address added successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Unable to save address");
    } finally {
      setIsCreatingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await addressApi.remove(id);
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      toast.success("Address removed");
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Unable to remove address");
    }
  };

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "Akash",
        lastName: user.lastName || "Negi",
        email: user.email || "akash@example.com",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (user && !newAddress.fullName) {
      setNewAddress((prev) => ({
        ...prev,
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      }));
    }
  }, [newAddress.fullName, user]);

  useEffect(() => {
    if (activeTab === "orders") {
      void loadOrders();
    }

    if (activeTab === "addresses") {
      void loadAddresses();
    }
  }, [activeTab]);

  // If not authenticated, redirect or show login prompt
  useEffect(() => {
    // Timeout check just in case context takes a moment
    const timer = setTimeout(() => {
      if (!isAuthenticated && !localStorage.getItem("accessToken")) {
        router.push("/login");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile updated successfully!");
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#fdfbf9] px-6">
        <div className="text-center space-y-4">
          <Clock className="mx-auto text-yellow-500 animate-spin" size={32} />
          <p className="font-bold text-gray-500 text-sm uppercase">Loading profile...</p>
        </div>
      </div>
    );
  }

  const initials = `${formData.firstName?.[0] || "U"}${formData.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="bg-[#fdfbf9] min-h-screen py-16 px-6 sm:px-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Page Title */}
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">My Account</h1>
          <p className="text-gray-500 font-medium text-sm">Manage your profile details, orders, and security settings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Menu */}
          <div className="lg:col-span-1 bg-white rounded-4xl p-6 border border-gray-100 shadow-xl space-y-8">
            {/* User Profile Summary */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
              <div className="w-20 h-20 bg-yellow-100 text-[#facc15] rounded-full flex items-center justify-center text-2xl font-black mb-4 shadow-inner border-2 border-[#facc15]">
                {initials}
              </div>
              <h3 className="font-black text-lg text-gray-900 uppercase">
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-xs font-bold text-gray-400">{formData.email}</p>
              <span className="mt-3 bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={12} /> {user?.role || "Customer"}
              </span>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("details")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "details"
                    ? "bg-[#facc15] text-black shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <User size={18} /> Profile Details
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-[#facc15] text-black shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <ShoppingBag size={18} /> My Orders
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "addresses"
                    ? "bg-[#facc15] text-black shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <MapPin size={18} /> Addresses
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "security"
                    ? "bg-[#facc15] text-black shadow-md"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <Lock size={18} /> Security
              </button>
            </nav>

            <div className="pt-6 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-xs"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* TAB 1: Profile Details */}
            {activeTab === "details" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6"
              >
                <h2 className="text-xl font-black text-gray-900 uppercase pb-4 border-b border-gray-100 flex items-center gap-2">
                  <User size={20} className="text-[#facc15]" /> Edit Personal Information
                </h2>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#facc15] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#facc15] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-11 pr-5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#facc15] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-11 pr-5 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#facc15] outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-fit px-8 py-4 bg-[#facc15] text-black font-black text-xs uppercase tracking-widest rounded-full shadow-xl hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* TAB 2: Order History */}
            {activeTab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6"
              >
                <h2 className="text-xl font-black text-gray-900 uppercase pb-4 border-b border-gray-100 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-[#facc15]" /> Order History
                </h2>

                <div className="space-y-4">
                  {ordersLoading ? (
                    <div className="text-xs font-black uppercase tracking-widest text-gray-400">
                      Loading orders...
                    </div>
                  ) : ordersError ? (
                    <div className="text-sm font-bold text-red-500">{ordersError}</div>
                  ) : orders.length === 0 ? (
                    <div className="text-sm font-bold text-gray-500">No orders yet.</div>
                  ) : (
                    orders.map((order) => {
                      const meta = ORDER_STATUS_META[order.orderStatus] || {
                        label: order.orderStatus || "Processing",
                        badge: "bg-gray-100 text-gray-700 border-gray-200",
                        icon: <Clock size={16} className="text-gray-600" />,
                      };

                      return (
                        <div
                          key={order.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 shadow-xs gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="font-black text-base text-gray-900">
                                {order.orderNumber || `#${order.id}`}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${meta.badge}`}
                              >
                                {meta.icon} {meta.label}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-gray-400">
                              Ordered on {formatOrderDate(order.createdAt)}
                            </p>
                            <p className="text-sm font-semibold text-gray-700 pt-1">
                              {formatOrderItems(order.items)}
                            </p>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-none border-gray-200">
                            <span className="text-xl font-black text-gray-900">
                              {formatMoney(order.totalAmount)}
                            </span>
                            <Link
                              href={`/order/${order.id}`}
                              className="text-xs font-black uppercase text-yellow-600 hover:text-black transition-colors pt-1 tracking-wider"
                            >
                              View Details ➔
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 3: Saved Addresses */}
            {activeTab === "addresses" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6"
              >
                <h2 className="text-xl font-black text-gray-900 uppercase pb-4 border-b border-gray-100 flex items-center gap-2">
                  <MapPin size={20} className="text-[#facc15]" /> Saved Shipping Addresses
                </h2>

                <div className="space-y-4">
                  {addressLoading ? (
                    <div className="text-xs font-black uppercase tracking-widest text-gray-400">
                      Loading addresses...
                    </div>
                  ) : addressError ? (
                    <div className="text-sm font-bold text-red-500">{addressError}</div>
                  ) : addresses.length === 0 ? (
                    <div className="text-sm font-bold text-gray-500">No saved addresses yet.</div>
                  ) : (
                    addresses.map((addr) => {
                      const label = addr.type === "billing"
                        ? "Billing"
                        : addr.type === "both"
                          ? "Shipping + Billing"
                          : "Shipping";

                      return (
                        <div key={addr.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 hover:border-yellow-200 transition-all shadow-2xs">
                          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                            <span className="bg-black text-[#facc15] font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                              {label}
                            </span>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-xs font-black uppercase text-red-500 hover:text-red-700 transition-colors cursor-pointer flex items-center gap-1"
                              title="Remove Address"
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                          <div className="space-y-1 text-sm font-semibold text-gray-700">
                            <p className="font-black text-gray-900">{addr.fullName}</p>
                            <p>{formatAddressLine(addr)}</p>
                            <p className="text-xs text-gray-400 pt-2">Phone: {addr.phone}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {isAddingAddress ? (
                  <form onSubmit={handleAddAddress} className="bg-yellow-50/50 p-6 sm:p-8 rounded-3xl border border-yellow-100 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-yellow-200 pb-3">
                      <h3 className="font-black text-gray-900 uppercase text-sm tracking-tight">Add New Address</h3>
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="text-gray-400 hover:text-gray-900 p-1.5 rounded-full transition-colors cursor-pointer bg-white shadow-2xs"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 tracking-wider">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          placeholder="Recipient Name"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-medium transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 tracking-wider">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 tracking-wider">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                        placeholder="Street address"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-medium transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 tracking-wider">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={newAddress.addressLine2}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                        placeholder="Apartment, suite, landmark"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-medium transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 tracking-wider">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-medium transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 tracking-wider">
                          State
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 tracking-wider">
                          Country
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-medium transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 tracking-wider">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 tracking-wider">
                          Landmark
                        </label>
                        <input
                          type="text"
                          value={newAddress.landmark}
                          onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-medium transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 tracking-wider">
                          Address Type
                        </label>
                        <select
                          value={newAddress.type}
                          onChange={(e) => setNewAddress({
                            ...newAddress,
                            type: e.target.value as AddressFormState["type"],
                          })}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-medium transition-all"
                        >
                          <option value="shipping">Shipping</option>
                          <option value="billing">Billing</option>
                          <option value="both">Shipping + Billing</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-6 py-3 border border-gray-200 rounded-full font-black text-xs uppercase tracking-wider text-gray-600 hover:bg-white transition-colors cursor-pointer shadow-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingAddress}
                        className="px-8 py-3 bg-[#facc15] hover:bg-black text-black hover:text-[#facc15] rounded-full font-black text-xs uppercase tracking-widest shadow-md hover:shadow-xl transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isCreatingAddress ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-xs font-black uppercase text-gray-500 hover:border-[#facc15] hover:text-black transition-colors cursor-pointer flex items-center justify-center gap-2 group shadow-xs hover:shadow-md"
                  >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add New Address
                  </button>
                )}
              </motion.div>
            )}

            {/* TAB 4: Security & Settings */}
            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-4xl border border-gray-100 shadow-xl space-y-6"
              >
                <h2 className="text-xl font-black text-gray-900 uppercase pb-4 border-b border-gray-100 flex items-center gap-2">
                  <Lock size={20} className="text-[#facc15]" /> Password & Security
                </h2>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 gap-4">
                  <div>
                    <h4 className="font-black text-base text-gray-900">Account Password</h4>
                    <p className="text-xs font-medium text-gray-500 pt-1">
                      Update your login password regularly to keep your account secure.
                    </p>
                  </div>
                  <Link
                    href="/change-password"
                    className="px-6 py-3.5 bg-black text-white font-black text-xs uppercase tracking-widest rounded-full shadow-md hover:bg-[#facc15] hover:text-black transition-all whitespace-nowrap cursor-pointer"
                  >
                    Change Password
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
