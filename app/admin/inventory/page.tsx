"use client";
import React, { useState } from "react";
import { Search, Warehouse, RefreshCw, AlertTriangle, CheckCircle, Package } from "lucide-react";
import Image from "next/image";

const initialInventory = [
  { id: 1, name: "Kashmiri Walnuts", sku: "EV-KW-001", category: "Dry Fruits", stock: 45, threshold: 15, status: "In Stock", image: "/Img/walnuts.jpg" },
  { id: 2, name: "Kashmiri Dry Honey", sku: "EV-KH-002", category: "Honey", stock: 8, threshold: 15, status: "Low Stock", image: "/Img/honey.jpeg" },
  { id: 3, name: "Kashmiri Almonds", sku: "EV-KA-003", category: "Dry Fruits", stock: 88, threshold: 20, status: "In Stock", image: "/Img/almonds.jpg" },
  { id: 4, name: "Kashmiri Blueberry", sku: "EV-KB-004", category: "Berries", stock: 0, threshold: 10, status: "Out of Stock", image: "/Img/blueberry.jpg" },
  { id: 5, name: "Organic Saffron 1g", sku: "EV-OS-005", category: "Spices", stock: 120, threshold: 25, status: "In Stock", image: "/Img/product1.png" },
];

export default function AdminInventory() {
  const [items, setItems] = useState(initialInventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLowStock = !filterLowStock || item.stock <= item.threshold;
    return matchesSearch && matchesLowStock;
  });

  const handleRestock = (id: number, amount: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newStock = item.stock + amount;
        let newStatus = "In Stock";
        if (newStock === 0) newStatus = "Out of Stock";
        else if (newStock <= item.threshold) newStatus = "Low Stock";
        return { ...item, stock: newStock, status: newStatus };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Inventory & Stock</h2>
          <p className="text-gray-500 font-medium text-sm">Monitor warehouse availability, low-stock alerts, and quick item replenishment.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all cursor-pointer ${
              filterLowStock ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <AlertTriangle size={16} />
            {filterLowStock ? "Showing Low Stock" : "Filter Low Stock"}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inventory by product name or SKU..."
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
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Product</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">SKU</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Stock Level</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <Package className="text-gray-400" size={24} />
                        )}
                      </div>
                      <div>
                        <span className="font-black text-gray-900 uppercase tracking-tight block">{item.name}</span>
                        <span className="text-xs font-bold text-gray-400">{item.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-mono text-sm font-bold text-gray-700">{item.sku}</td>
                  <td className="px-8 py-5">
                    <div className="space-y-1 max-w-xs">
                      <div className="flex justify-between text-xs font-bold text-gray-700">
                        <span>{item.stock} units</span>
                        <span className="text-gray-400">Min: {item.threshold}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all rounded-full ${
                            item.stock === 0 ? "bg-red-500 w-0" :
                            item.stock <= item.threshold ? "bg-amber-500" :
                            "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(100, (item.stock / (item.threshold * 3)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      item.status === "In Stock" ? "bg-green-100 text-green-700" :
                      item.status === "Low Stock" ? "bg-orange-100 text-orange-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {item.status === "In Stock" && <CheckCircle size={12} />}
                      {item.status === "Low Stock" && <AlertTriangle size={12} />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRestock(item.id, 25)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 hover:bg-black text-[#facc15] font-black text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                        title="Add 25 units"
                      >
                        <RefreshCw size={12} />
                        +25
                      </button>
                      <button
                        onClick={() => handleRestock(item.id, 50)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 hover:bg-black text-[#facc15] font-black text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                        title="Add 50 units"
                      >
                        <RefreshCw size={12} />
                        +50
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
