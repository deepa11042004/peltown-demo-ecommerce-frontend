"use client";
import React, { useState } from "react";
import { Search, Star, MessageSquare, Check, X, Trash2 } from "lucide-react";
import Image from "next/image";

const initialReviews = [
  { id: 1, customer: "Alice Morgan", email: "alice@example.com", product: "Kashmiri Walnuts", rating: 5, comment: "Absolutely top quality walnuts! Crunchy, fresh, and properly packed. Will order again.", date: "May 18, 2026", status: "Approved", image: "/Img/walnuts.jpg" },
  { id: 2, customer: "Mark Spencer", email: "mark@example.com", product: "Kashmiri Dry Honey", rating: 4, comment: "Very unique taste, unlike regular honey. Delivery took one extra day but worth it.", date: "May 17, 2026", status: "Approved", image: "/Img/honey.jpeg" },
  { id: 3, customer: "Sophia Taylor", email: "sophia@example.com", product: "Kashmiri Almonds", rating: 5, comment: "These almonds are massive and extremely sweet. Premium quality indeed.", date: "May 16, 2026", status: "Pending", image: "/Img/almonds.jpg" },
  { id: 4, customer: "Robert King", email: "robert@example.com", product: "Kashmiri Blueberry", rating: 1, comment: "Package arrived with damaged wrapping. Disappointed.", date: "May 15, 2026", status: "Rejected", image: "/Img/blueberry.jpg" },
  { id: 5, customer: "Emma Watson", email: "emma@example.com", product: "Kashmiri Walnuts", rating: 5, comment: "Perfect gift for festive season. Everyone in my family loved the rich taste.", date: "May 12, 2026", status: "Pending", image: "/Img/walnuts.jpg" },
];

export default function AdminReviews() {
  const [reviews, setReviews] = useState(initialReviews);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.customer.toLowerCase().includes(searchQuery.toLowerCase()) || r.product.toLowerCase().includes(searchQuery.toLowerCase()) || r.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id: number, newStatus: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this review?")) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1 text-[#facc15]">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className={i < rating ? "fill-[#facc15]" : "text-gray-200"} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Customer Reviews</h2>
          <p className="text-gray-500 font-medium text-sm">Moderate user reviews, ratings, and feedback before publishing to store pages.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, product, or comment..."
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#facc15] outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-auto bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[#facc15] outline-none cursor-pointer"
        >
          <option value="All">All Reviews</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-4xl border border-gray-100 shadow-xl overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <MessageSquare className="mx-auto mb-4 text-gray-300" size={48} />
            <p className="text-lg font-bold tracking-tight text-gray-800">No reviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Product</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Rating & Comment</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Date</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-black text-gray-900">{review.customer}</div>
                      <div className="text-xs font-bold text-gray-400">{review.email}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                          <Image src={review.image} alt={review.product} fill className="object-cover" />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{review.product}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 max-w-md">
                      {renderStars(review.rating)}
                      <p className="text-sm font-medium text-gray-600 mt-2 line-clamp-2">{review.comment}</p>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-xs font-bold text-gray-500">{review.date}</td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        review.status === "Approved" ? "bg-green-100 text-green-700" :
                        review.status === "Pending" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {review.status !== "Approved" && (
                          <button
                            onClick={() => handleUpdateStatus(review.id, "Approved")}
                            className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                            title="Approve Review"
                          >
                            <Check size={14} /> Approve
                          </button>
                        )}
                        {review.status !== "Rejected" && (
                          <button
                            onClick={() => handleUpdateStatus(review.id, "Rejected")}
                            className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                            title="Reject Review"
                          >
                            <X size={14} /> Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 size={16} />
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
    </div>
  );
}
