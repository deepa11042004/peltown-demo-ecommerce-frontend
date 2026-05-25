"use client";
import React, { useState } from "react";
import { Save, Store, DollarSign, Truck, Bell, CheckCircle } from "lucide-react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaved, setIsSaved] = useState(false);

  // Settings State
  const [storeName, setStoreName] = useState("Everace Premium Organics");
  const [contactEmail, setContactEmail] = useState("support@everace.com");
  const [phone, setPhone] = useState("+1 (800) 555-EVER");
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState("10");
  const [flatShipping, setFlatShipping] = useState("15.00");
  const [enableCod, setEnableCod] = useState(true);
  const [enableStripe, setEnableStripe] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Store Settings</h2>
          <p className="text-gray-500 font-medium text-sm">Configure global checkout rules, currency, tax rates, and store identity.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 bg-[#facc15] text-black px-8 py-3.5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#facc15]/90 transition-all shadow-xl shadow-[#facc15]/20 cursor-pointer"
        >
          {isSaved ? <CheckCircle size={18} className="text-green-800" /> : <Save size={18} />}
          {isSaved ? "Settings Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "general" ? "bg-black text-[#facc15] shadow-lg" : "bg-white text-gray-500 hover:text-black hover:bg-gray-50"
          }`}
        >
          <Store size={16} />
          General Info
        </button>
        <button
          onClick={() => setActiveTab("payment")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "payment" ? "bg-black text-[#facc15] shadow-lg" : "bg-white text-gray-500 hover:text-black hover:bg-gray-50"
          }`}
        >
          <DollarSign size={16} />
          Currency & Payment
        </button>
        <button
          onClick={() => setActiveTab("shipping")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "shipping" ? "bg-black text-[#facc15] shadow-lg" : "bg-white text-gray-500 hover:text-black hover:bg-gray-50"
          }`}
        >
          <Truck size={16} />
          Shipping & Tax
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "notifications" ? "bg-black text-[#facc15] shadow-lg" : "bg-white text-gray-500 hover:text-black hover:bg-gray-50"
          }`}
        >
          <Bell size={16} />
          Notifications
        </button>
      </div>

      {/* Settings Forms */}
      <form onSubmit={handleSave} className="bg-white rounded-4xl border border-gray-100 shadow-xl p-8 max-w-4xl">
        {activeTab === "general" && (
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-gray-900 border-b border-gray-100 pb-4">General Store Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-medium text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Store Brand Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-3.5 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-bold text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Customer Support Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-3.5 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-bold text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Contact Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-3.5 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-bold text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Store Headquarters Address</label>
                <input
                  type="text"
                  defaultValue="100 Organic Way, Valley Creek, NY 10024"
                  className="w-full bg-gray-50 rounded-2xl px-5 py-3.5 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-bold text-gray-900"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-gray-900 border-b border-gray-100 pb-4">Currency & Payment Gateways</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-medium text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Primary Display Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-3.5 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-bold text-gray-900"
                >
                  <option value="USD">USD (₹) - United States Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                </select>
              </div>

              <div className="space-y-4 pt-2">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Active Payment Methods</label>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900">Cash on Delivery (COD)</p>
                    <p className="text-xs text-gray-500">Allow customers to pay upon package receipt</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableCod}
                    onChange={e => setEnableCod(e.target.checked)}
                    className="w-5 h-5 accent-black cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900">Stripe Secure Gateway</p>
                    <p className="text-xs text-gray-500">Accept Credit/Debit Cards, Apple Pay & Google Pay</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableStripe}
                    onChange={e => setEnableStripe(e.target.checked)}
                    className="w-5 h-5 accent-black cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "shipping" && (
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-gray-900 border-b border-gray-100 pb-4">Shipping Zones & Tax Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-medium text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Default Flat Shipping Fee (₹)</label>
                <input
                  type="text"
                  value={flatShipping}
                  onChange={e => setFlatShipping(e.target.value)}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-3.5 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-bold text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Global Checkout Tax Rate (%)</label>
                <input
                  type="text"
                  value={taxRate}
                  onChange={e => setTaxRate(e.target.value)}
                  className="w-full bg-gray-50 rounded-2xl px-5 py-3.5 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-bold text-gray-900"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-gray-900 border-b border-gray-100 pb-4">Automated Email Notifications</h3>
            <div className="space-y-4 font-medium text-sm">
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900 text-base">New Order Admin Alerts</p>
                  <p className="text-xs text-gray-500 mt-0.5">Receive immediate notification whenever a customer places an order</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={e => setEmailAlerts(e.target.checked)}
                  className="w-6 h-6 accent-black cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900 text-base">Low Stock Warehouse Warnings</p>
                  <p className="text-xs text-gray-500 mt-0.5">Send alert when any product drops below inventory restock threshold</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-6 h-6 accent-black cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
