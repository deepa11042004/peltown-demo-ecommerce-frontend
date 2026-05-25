"use client";
import React, { useState } from "react";
import { Search, Plus, Tag, Trash2, Edit, CheckCircle, AlertCircle, Copy } from "lucide-react";

const initialCoupons = [
  { id: 1, code: "WELCOME10", discount: "10%", type: "Percentage", minSpend: "₹50", usage: "45 / 100", expiry: "June 30, 2026", status: "Active" },
  { id: 2, code: "FESTIVE20", discount: "₹20", type: "Fixed Amount", minSpend: "₹100", usage: "12 / 50", expiry: "May 25, 2026", status: "Active" },
  { id: 3, code: "FREESHIP", discount: "Free Shipping", type: "Shipping", minSpend: "₹75", usage: "88 / 200", expiry: "July 15, 2026", status: "Active" },
  { id: 4, code: "VIPSPECIAL", discount: "25%", type: "Percentage", minSpend: "₹150", usage: "100 / 100", expiry: "May 10, 2026", status: "Expired" },
  { id: 5, code: "SUMMER5", discount: "₹5", type: "Fixed Amount", minSpend: "₹30", usage: "0 / 500", expiry: "Aug 31, 2026", status: "Disabled" },
];

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [newType, setNewType] = useState("Percentage");
  const [newMinSpend, setNewMinSpend] = useState("₹50");
  const [newExpiry, setNewExpiry] = useState("Dec 31, 2026");

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newDiscount) return;
    const newCoupon = {
      id: Date.now(),
      code: newCode.toUpperCase(),
      discount: newType === "Percentage" ? `${newDiscount}%` : `₹${newDiscount}`,
      type: newType,
      minSpend: newMinSpend,
      usage: "0 / 100",
      expiry: newExpiry,
      status: "Active",
    };
    setCoupons([newCoupon, ...coupons]);
    setIsAddModalOpen(false);
    setNewCode("");
    setNewDiscount("");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      setCoupons(coupons.filter(c => c.id !== id));
    }
  };

  const handleToggleStatus = (id: number) => {
    setCoupons(coupons.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === "Active" ? "Disabled" : "Active";
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
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

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coupon by code..."
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#facc15] outline-none"
          />
        </div>
      </div>

      {/* Table */}
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
              {filteredCoupons.map((coupon) => (
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
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-gray-900 text-base">{coupon.discount}</td>
                  <td className="px-8 py-5 font-semibold text-gray-600 text-sm">{coupon.type}</td>
                  <td className="px-8 py-5 font-bold text-gray-600 text-sm">{coupon.minSpend}</td>
                  <td className="px-8 py-5 font-bold text-gray-600 text-sm">{coupon.usage}</td>
                  <td className="px-8 py-5 font-medium text-gray-500 text-sm">{coupon.expiry}</td>
                  <td className="px-8 py-5">
                    <button
                      onClick={() => handleToggleStatus(coupon.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter cursor-pointer transition-all ${
                        coupon.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-200" :
                        coupon.status === "Expired" ? "bg-gray-100 text-gray-500 cursor-not-allowed" :
                        "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {coupon.status === "Active" && <CheckCircle size={12} />}
                      {coupon.status === "Disabled" && <AlertCircle size={12} />}
                      {coupon.status}
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 z-50 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-black uppercase text-gray-900">Create New Coupon</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="font-bold text-gray-400 hover:text-gray-900 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleAddCoupon} className="space-y-4 text-sm font-medium">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  placeholder="e.g. SUMMER20"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-bold"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={newDiscount}
                    onChange={e => setNewDiscount(e.target.value)}
                    placeholder={newType === "Percentage" ? "15" : "25"}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Minimum Spend (₹)</label>
                <input
                  type="text"
                  value={newMinSpend}
                  onChange={e => setNewMinSpend(e.target.value)}
                  placeholder="₹50"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Expiry Date</label>
                <input
                  type="text"
                  value={newExpiry}
                  onChange={e => setNewExpiry(e.target.value)}
                  placeholder="Dec 31, 2026"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                />
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
                  className="px-6 py-3 rounded-full font-black bg-black hover:bg-gray-900 text-[#facc15] uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
