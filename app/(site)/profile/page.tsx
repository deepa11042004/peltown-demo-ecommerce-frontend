"use client";
import React, { useState, useEffect } from "react";
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
  Save,
  ShieldCheck,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

const mockOrders = [
  {
    id: "ORD-98231",
    date: "May 15, 2026",
    items: "Premium Kashmiri Walnuts (2x), Pure Acacia Honey",
    total: "₹78.00",
    status: "Delivered",
    icon: <CheckCircle2 size={16} className="text-green-600" />,
    badgeBg: "bg-green-50 text-green-700 border-green-200",
  },
  {
    id: "ORD-87412",
    date: "May 02, 2026",
    items: "Almond Healthy Fat Snack Pack",
    total: "₹44.00",
    status: "In Transit",
    icon: <Truck size={16} className="text-yellow-600" />,
    badgeBg: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  {
    id: "ORD-75622",
    date: "Apr 18, 2026",
    items: "Dried Saffron Berries (1x)",
    total: "₹52.00",
    status: "Delivered",
    icon: <CheckCircle2 size={16} className="text-green-600" />,
    badgeBg: "bg-green-50 text-green-700 border-green-200",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"details" | "orders" | "addresses" | "security">("details");
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+91 98765 43210",
    address: "128 Alpine Ridge Boulevard, Pampore Sector 4, Kashmir 190001",
  });

  interface Address {
    id: string;
    label: string;
    name: string;
    address: string;
    phone: string;
    isDefault: boolean;
  }

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "addr-1",
      label: "Default Billing & Shipping",
      name: "Akash Negi",
      address: "128 Alpine Ridge Boulevard, Pampore Sector 4, Kashmir 190001",
      phone: "+91 98765 43210",
      isDefault: true,
    },
  ]);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    name: "",
    address: "",
    phone: "",
  });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.name || !newAddress.address || !newAddress.phone) {
      toast.error("Please fill all required fields");
      return;
    }
    const created: Address = {
      id: `addr-${Date.now()}`,
      label: newAddress.label || "Home",
      name: newAddress.name,
      address: newAddress.address,
      phone: newAddress.phone,
      isDefault: addresses.length === 0,
    };
    setAddresses([...addresses, created]);
    setIsAddingAddress(false);
    setNewAddress({ label: "Home", name: "", address: "", phone: "" });
    toast.success("New address added successfully!");
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    toast.success("Address removed");
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
                  {mockOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 shadow-xs gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-base text-gray-900">{order.id}</span>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${order.badgeBg}`}
                          >
                            {order.icon} {order.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-400">Ordered on {order.date}</p>
                        <p className="text-sm font-semibold text-gray-700 pt-1">{order.items}</p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-none border-gray-200">
                        <span className="text-xl font-black text-gray-900">{order.total}</span>
                        <Link
                          href={`/order/${order.id}`}
                          className="text-xs font-black uppercase text-yellow-600 hover:text-black transition-colors pt-1 tracking-wider"
                        >
                          View Details ➔
                        </Link>
                      </div>
                    </div>
                  ))}
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
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 hover:border-yellow-200 transition-all shadow-2xs">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <span className="bg-black text-[#facc15] font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                          {addr.label}
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
                        <p className="font-black text-gray-900">{addr.name}</p>
                        <p>{addr.address}</p>
                        <p className="text-xs text-gray-400 pt-2">Phone: {addr.phone}</p>
                      </div>
                    </div>
                  ))}
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
                          Label (Home, Office, etc.)
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.label}
                          onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                          placeholder="e.g. Home, Office"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-medium transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 tracking-wider">
                          Recipient Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          placeholder="Full Name"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-gray-700 mb-1.5 tracking-wider">
                        Full Street Address
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                        placeholder="Street address, Apartment/Suite, City, State, PIN Code"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-yellow-500 font-medium resize-none transition-all"
                      ></textarea>
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
                        className="px-8 py-3 bg-[#facc15] hover:bg-black text-black hover:text-[#facc15] rounded-full font-black text-xs uppercase tracking-widest shadow-md hover:shadow-xl transition-all cursor-pointer"
                      >
                        Save Address
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
