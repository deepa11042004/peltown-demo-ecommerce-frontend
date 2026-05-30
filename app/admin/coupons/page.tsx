"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, Plus, Tag, Trash2, CheckCircle, AlertCircle, Copy, Pencil } from "lucide-react";
import { adminCouponApi } from "@/lib/api";

type CouponType = "PERCENTAGE" | "FIXED_AMOUNT";

type Coupon = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  couponType: CouponType;
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount: number | null;
  usageLimit: number | null;
  perUserUsageLimit?: number | null;
  usedCount: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

const toDateTimeLocalValue = (value?: string | null) => {
  const parsed = value ? new Date(value) : new Date();

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 16);
  }

  const offsetMs = parsed.getTimezoneOffset() * 60 * 1000;
  return new Date(parsed.getTime() - offsetMs).toISOString().slice(0, 16);
};

const formatMoney = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const isExpired = (value: string) => {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.getTime() < Date.now();
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

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null);

  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("Welcome Offer");
  const [newDescription, setNewDescription] = useState("Limited time discount offer");
  const [newType, setNewType] = useState<CouponType>("PERCENTAGE");
  const [newDiscount, setNewDiscount] = useState("");
  const [newMinSpend, setNewMinSpend] = useState("0");
  const [newMaxDiscount, setNewMaxDiscount] = useState("");
  const [newUsageLimit, setNewUsageLimit] = useState("");
  const [newPerUserUsageLimit, setNewPerUserUsageLimit] = useState("1");
  const [newStartsAt, setNewStartsAt] = useState(new Date().toISOString().slice(0, 16));
  const [newExpiry, setNewExpiry] = useState("");

  const [editCode, setEditCode] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<CouponType>("PERCENTAGE");
  const [editDiscount, setEditDiscount] = useState("");
  const [editMinSpend, setEditMinSpend] = useState("0");
  const [editMaxDiscount, setEditMaxDiscount] = useState("");
  const [editUsageLimit, setEditUsageLimit] = useState("");
  const [editPerUserUsageLimit, setEditPerUserUsageLimit] = useState("1");
  const [editStartsAt, setEditStartsAt] = useState(new Date().toISOString().slice(0, 16));
  const [editExpiry, setEditExpiry] = useState("");

  const loadCoupons = async () => {
    setLoading(true);

    try {
      const response = await adminCouponApi.list({ limit: 100, sort: "createdAt_desc" });
      const items = response.data?.data?.items;
      setCoupons(Array.isArray(items) ? (items as Coupon[]) : []);
    } catch (error) {
      setCoupons([]);
      toast.error(getErrorMessage(error, "Unable to fetch coupons"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCoupons();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const filteredCoupons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return coupons;
    }

    return coupons.filter((coupon) => {
      const code = coupon.code?.toLowerCase() || "";
      const title = coupon.title?.toLowerCase() || "";
      return code.includes(query) || title.includes(query);
    });
  }, [coupons, searchQuery]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddCoupon = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newCode.trim() || !newDiscount.trim() || !newExpiry) {
      toast.error("Code, discount, and expiry are required");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        code: newCode.trim().toUpperCase(),
        title: newTitle.trim() || "Coupon",
        description: newDescription.trim() || null,
        couponType: newType,
        discountValue: Number(newDiscount),
        minimumOrderAmount: Number(newMinSpend || 0),
        maximumDiscountAmount: newMaxDiscount.trim() ? Number(newMaxDiscount) : null,
        usageLimit: newUsageLimit.trim() ? Number(newUsageLimit) : null,
        perUserUsageLimit: newPerUserUsageLimit.trim() ? Number(newPerUserUsageLimit) : null,
        startsAt: new Date(newStartsAt).toISOString(),
        expiresAt: new Date(newExpiry).toISOString(),
        isActive: true,
        stackable: false,
      };

      await adminCouponApi.create(payload);
      toast.success("Coupon created successfully");
      setIsAddModalOpen(false);
      setNewCode("");
      setNewDiscount("");
      setNewMaxDiscount("");
      setNewUsageLimit("");
      setNewPerUserUsageLimit("1");
      setNewExpiry("");
      await loadCoupons();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create coupon"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      await adminCouponApi.remove(id);
      setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
      toast.success("Coupon deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete coupon"));
    }
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setEditCode(coupon.code || "");
    setEditTitle(coupon.title || "");
    setEditDescription(coupon.description || "");
    setEditType(coupon.couponType || "PERCENTAGE");
    setEditDiscount(String(coupon.discountValue ?? ""));
    setEditMinSpend(String(coupon.minimumOrderAmount ?? 0));
    setEditMaxDiscount(coupon.maximumDiscountAmount == null ? "" : String(coupon.maximumDiscountAmount));
    setEditUsageLimit(coupon.usageLimit == null ? "" : String(coupon.usageLimit));
    setEditPerUserUsageLimit(coupon.perUserUsageLimit == null ? "" : String(coupon.perUserUsageLimit));
    setEditStartsAt(toDateTimeLocalValue(coupon.startsAt));
    setEditExpiry(toDateTimeLocalValue(coupon.expiresAt));
    setIsEditModalOpen(true);
  };

  const handleUpdateCoupon = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingCouponId) {
      toast.error("No coupon selected for editing");
      return;
    }

    if (!editCode.trim() || !editDiscount.trim() || !editExpiry) {
      toast.error("Code, discount, and expiry are required");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        code: editCode.trim().toUpperCase(),
        title: editTitle.trim() || "Coupon",
        description: editDescription.trim() || null,
        couponType: editType,
        discountValue: Number(editDiscount),
        minimumOrderAmount: Number(editMinSpend || 0),
        maximumDiscountAmount: editMaxDiscount.trim() ? Number(editMaxDiscount) : null,
        usageLimit: editUsageLimit.trim() ? Number(editUsageLimit) : null,
        perUserUsageLimit: editPerUserUsageLimit.trim() ? Number(editPerUserUsageLimit) : null,
        startsAt: new Date(editStartsAt).toISOString(),
        expiresAt: new Date(editExpiry).toISOString(),
      };

      await adminCouponApi.update(editingCouponId, payload);
      toast.success("Coupon updated successfully");
      setIsEditModalOpen(false);
      setEditingCouponId(null);
      await loadCoupons();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update coupon"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    if (isExpired(coupon.expiresAt)) {
      return;
    }

    const nextStatus = !coupon.isActive;

    try {
      await adminCouponApi.toggle(coupon.id, nextStatus);
      setCoupons((prev) => prev.map((item) => {
        if (item.id === coupon.id) {
          return { ...item, isActive: nextStatus };
        }
        return item;
      }));
      toast.success(`Coupon ${nextStatus ? "enabled" : "disabled"}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to change coupon status"));
    }
  };

  const getCouponStatus = (coupon: Coupon) => {
    if (isExpired(coupon.expiresAt)) {
      return "Expired";
    }

    return coupon.isActive ? "Active" : "Disabled";
  };

  const getDiscountLabel = (coupon: Coupon) => {
    if (coupon.couponType === "PERCENTAGE") {
      return `${coupon.discountValue}%`;
    }

    return formatMoney(coupon.discountValue);
  };

  const getTypeLabel = (couponType: CouponType) => {
    if (couponType === "PERCENTAGE") {
      return "Percentage";
    }

    return "Fixed Amount";
  };

  const getUsageLabel = (coupon: Coupon) => {
    if (coupon.usageLimit == null) {
      return `${coupon.usedCount} / unlimited`;
    }

    return `${coupon.usedCount} / ${coupon.usageLimit}`;
  };

  const minDateTime = useMemo(() => new Date().toISOString().slice(0, 16), []);

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Coupons & Discounts</h2>
          <p className="text-gray-500 font-medium text-sm">Create promo codes, manage discount tiers, and configure expiration rules.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gray-900 text-[#facc15] px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-[#facc15]/20 cursor-pointer"
        >
          <Plus size={18} />
          Create Coupon
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search coupon by code or title..."
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#facc15] outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-4xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Coupon Code</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Discount</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Type</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Min Spend</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Usage</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Expires</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td className="px-8 py-8 text-sm font-semibold text-gray-500" colSpan={8}>Loading coupons...</td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td className="px-8 py-8 text-sm font-semibold text-gray-500" colSpan={8}>No coupons found.</td>
                </tr>
              ) : filteredCoupons.map((coupon) => {
                const status = getCouponStatus(coupon);

                return (
                  <tr key={coupon.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                          <Tag size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-gray-900 tracking-wider font-mono text-base">{coupon.code}</span>
                            <button
                              onClick={() => copyToClipboard(coupon.code)}
                              className="text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                              title="Copy Code"
                            >
                              <Copy size={14} />
                            </button>
                            {copiedCode === coupon.code && <span className="text-[10px] text-green-600 font-bold">Copied!</span>}
                          </div>
                          <p className="text-[11px] text-gray-500 font-semibold">{coupon.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-black text-gray-900 text-base">{getDiscountLabel(coupon)}</td>
                    <td className="px-8 py-5 font-semibold text-gray-600 text-sm">{getTypeLabel(coupon.couponType)}</td>
                    <td className="px-8 py-5 font-bold text-gray-600 text-sm">{formatMoney(coupon.minimumOrderAmount)}</td>
                    <td className="px-8 py-5 font-bold text-gray-600 text-sm">{getUsageLabel(coupon)}</td>
                    <td className="px-8 py-5 font-medium text-gray-500 text-sm">{formatDate(coupon.expiresAt)}</td>
                    <td className="px-8 py-5">
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        disabled={status === "Expired"}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter cursor-pointer transition-all ${
                          status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-200" :
                          status === "Expired" ? "bg-gray-100 text-gray-500 cursor-not-allowed" :
                          "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {status === "Active" && <CheckCircle size={12} />}
                        {status === "Disabled" && <AlertCircle size={12} />}
                        {status}
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Edit Coupon"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 z-50 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-black uppercase text-gray-900">Create New Coupon</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="font-bold text-gray-400 hover:text-gray-900 cursor-pointer">X</button>
            </div>
            <form onSubmit={handleAddCoupon} className="space-y-4 text-sm font-medium">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(event) => setNewCode(event.target.value)}
                    placeholder="e.g. SUMMER20"
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(event) => setNewType(event.target.value as CouponType)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-bold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (INR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={newDiscount}
                    onChange={(event) => setNewDiscount(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Minimum Spend</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newMinSpend}
                    onChange={(event) => setNewMinSpend(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Max Discount (optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newMaxDiscount}
                    onChange={(event) => setNewMaxDiscount(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Usage Limit (optional)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={newUsageLimit}
                    onChange={(event) => setNewUsageLimit(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Per-user Limit (optional)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={newPerUserUsageLimit}
                    onChange={(event) => setNewPerUserUsageLimit(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Starts At</label>
                  <input
                    type="datetime-local"
                    required
                    min={minDateTime}
                    value={newStartsAt}
                    onChange={(event) => setNewStartsAt(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Expires At</label>
                  <input
                    type="datetime-local"
                    required
                    min={newStartsAt || minDateTime}
                    value={newExpiry}
                    onChange={(event) => setNewExpiry(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-3 rounded-full font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-full font-black bg-black hover:bg-gray-900 text-[#facc15] uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsEditModalOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 z-50 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-black uppercase text-gray-900">Edit Coupon</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="font-bold text-gray-400 hover:text-gray-900 cursor-pointer">X</button>
            </div>
            <form onSubmit={handleUpdateCoupon} className="space-y-4 text-sm font-medium">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(event) => setEditCode(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Type</label>
                  <select
                    value={editType}
                    onChange={(event) => setEditType(event.target.value as CouponType)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-bold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (INR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={editDiscount}
                    onChange={(event) => setEditDiscount(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Minimum Spend</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editMinSpend}
                    onChange={(event) => setEditMinSpend(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Max Discount (optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editMaxDiscount}
                    onChange={(event) => setEditMaxDiscount(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Usage Limit (optional)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={editUsageLimit}
                    onChange={(event) => setEditUsageLimit(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Per-user Limit (optional)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={editPerUserUsageLimit}
                    onChange={(event) => setEditPerUserUsageLimit(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Starts At</label>
                  <input
                    type="datetime-local"
                    required
                    value={editStartsAt}
                    onChange={(event) => setEditStartsAt(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Expires At</label>
                  <input
                    type="datetime-local"
                    required
                    min={editStartsAt}
                    value={editExpiry}
                    onChange={(event) => setEditExpiry(event.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 rounded-full font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-full font-black bg-black hover:bg-gray-900 text-[#facc15] uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Update Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
