"use client";
import React, { useState } from "react";
import { Plus, Image as ImageIcon, Trash2, Link2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

const initialBanners = [
  { id: 1, title: "Summer Harvest Mega Sale", subtitle: "Flat 20% Off on all Kashmiri Dry Fruits", link: "/products?category=dry-fruits", placement: "Hero Carousel", image: "/Img/walnuts.jpg", active: true },
  { id: 2, title: "Pure Organic Honey Showcase", subtitle: "Sourced directly from Himalayan valleys", link: "/products?category=honey", placement: "Mid-section Promo", image: "/Img/honey.jpeg", active: true },
  { id: 3, title: "Premium Saffron Gift Boxes", subtitle: "Exclusive packaging for festive greetings", link: "/products?category=spices", placement: "Hero Carousel", image: "/Img/almonds.jpg", active: false },
  { id: 4, title: "Fresh Berry Delight", subtitle: "Try our crunchy sun-dried blueberries", link: "/products?category=berries", placement: "Category Header", image: "/Img/blueberry.jpg", active: true },
];

export default function AdminBanners() {
  const [banners, setBanners] = useState(initialBanners);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newLink, setNewLink] = useState("/products");
  const [newPlacement, setNewPlacement] = useState("Hero Carousel");

  const handleToggleActive = (id: number) => {
    setBanners(banners.map(b => b.id === id ? { ...b, active: !b.active } : b));
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this promotional banner?")) {
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const newBanner = {
      id: Date.now(),
      title: newTitle,
      subtitle: newSubtitle || "Limited Time Offer",
      link: newLink,
      placement: newPlacement,
      image: "/Img/walnuts.jpg", // Default image placeholder
      active: true,
    };
    setBanners([newBanner, ...banners]);
    setIsAddModalOpen(false);
    setNewTitle("");
    setNewSubtitle("");
  };

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Promotional Banners</h2>
          <p className="text-gray-500 font-medium text-sm">Manage website header carousels, marketing promotions, and promotional graphics.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gray-900 text-[#facc15] px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-[#facc15]/20 cursor-pointer"
        >
          <Plus size={18} />
          Upload Banner
        </button>
      </div>

      {/* Grid view of banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-4xl border border-gray-100 shadow-xl overflow-hidden flex flex-col group">
            <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
              <Image src={banner.image} alt={banner.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-4 right-4 flex gap-2">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-[#facc15] font-black text-[10px] uppercase tracking-wider rounded-full border border-white/10">
                  {banner.placement}
                </span>
                <button
                  onClick={() => handleToggleActive(banner.id)}
                  className={`px-3 py-1 font-black text-[10px] uppercase tracking-wider rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                    banner.active ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                  }`}
                  title={banner.active ? "Deactivate Banner" : "Activate Banner"}
                >
                  {banner.active ? <Eye size={12} /> : <EyeOff size={12} />}
                  {banner.active ? "Active" : "Inactive"}
                </button>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-xl font-black uppercase tracking-tight text-white drop-shadow-md">{banner.title}</h3>
                <p className="text-xs font-semibold text-gray-200 mt-1 drop-shadow-sm">{banner.subtitle}</p>
              </div>
            </div>

            <div className="p-6 flex items-center justify-between bg-white border-t border-gray-50">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 truncate max-w-xs">
                <Link2 size={16} className="text-[#facc15] shrink-0" />
                <span className="truncate">{banner.link}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 z-50 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-black uppercase text-gray-900">Upload New Banner</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="font-bold text-gray-400 hover:text-gray-900 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleAddBanner} className="space-y-4 text-sm font-medium">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Eid Mega Discount"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Subtitle / Offer Details</label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={e => setNewSubtitle(e.target.value)}
                  placeholder="e.g. Save flat 30% on premium almonds"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Target Link URL</label>
                <input
                  type="text"
                  value={newLink}
                  onChange={e => setNewLink(e.target.value)}
                  placeholder="/products?category=dry-fruits"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Placement Section</label>
                <select
                  value={newPlacement}
                  onChange={e => setNewPlacement(e.target.value)}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-bold"
                >
                  <option value="Hero Carousel">Hero Carousel</option>
                  <option value="Mid-section Promo">Mid-section Promo</option>
                  <option value="Category Header">Category Header</option>
                  <option value="Checkout Alert">Checkout Alert</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Banner Graphic</label>
                <div className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-[#facc15] transition-colors cursor-pointer">
                  <ImageIcon size={32} className="mb-2 text-gray-400" />
                  <span className="text-xs font-bold text-gray-600">Click to browse or drag image file</span>
                  <span className="text-[10px] text-gray-400">1920x600px recommended (WEBP/PNG)</span>
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
                  className="px-6 py-3 rounded-full font-black bg-black hover:bg-gray-900 text-[#facc15] uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
