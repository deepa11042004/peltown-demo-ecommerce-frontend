"use client";
import React, { useState } from "react";
import {Plus, Search, Trash2, Key, CheckCircle } from "lucide-react";

const initialAdmins = [
  { id: 1, name: "Akash Sharma", email: "akash@everace.com", role: "Super Admin", status: "Active", lastActive: "Just now", avatar: "AS" },
  { id: 2, name: "Deepak Negi", email: "deepak@everace.com", role: "Super Admin", status: "Active", lastActive: "5 mins ago", avatar: "DN" },
  { id: 3, name: "Elena Rostova", email: "elena@everace.com", role: "Catalog Manager", status: "Active", lastActive: "2 hours ago", avatar: "ER" },
  { id: 4, name: "Marcus Brody", email: "marcus@everace.com", role: "Support Lead", status: "Active", lastActive: "1 day ago", avatar: "MB" },
  { id: 5, name: "Chloe Bennett", email: "chloe@everace.com", role: "Marketing Specialist", status: "Invited", lastActive: "Never (Pending)", avatar: "CB" },
];

export default function AdminAdmins() {
  const [admins, setAdmins] = useState(initialAdmins);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Catalog Manager");

  const filteredAdmins = admins.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleInviteAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    const initials = newName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const newAdmin = {
      id: Date.now(),
      name: newName,
      email: newEmail,
      role: newRole,
      status: "Invited",
      lastActive: "Never (Pending)",
      avatar: initials || "AD",
    };
    setAdmins([...admins, newAdmin]);
    setIsAddModalOpen(false);
    setNewName("");
    setNewEmail("");
  };

  const handleRemoveAdmin = (id: number, name: string) => {
    if (confirm(`Are you sure you want to revoke admin access for ${name}?`)) {
      setAdmins(admins.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Admin Team Management</h2>
          <p className="text-gray-500 font-medium text-sm">Control administrative security, assign specialized roles, and audit system logins.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gray-900 text-[#facc15] px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-[#facc15]/20 cursor-pointer"
        >
          <Plus size={18} />
          Invite Team Member
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
            placeholder="Search team member by name or email..."
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
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Team Member</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Assigned Role</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Last Activity</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Revoke Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-[#facc15] font-black text-sm border-2 border-gray-100 shadow-sm shrink-0">
                        {admin.avatar}
                      </div>
                      <div>
                        <span className="font-black text-gray-900 uppercase tracking-tight block">{admin.name}</span>
                        <span className="text-xs font-bold text-gray-400">{admin.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <Key className={admin.role === "Super Admin" ? "text-[#facc15]" : "text-gray-400"} size={16} />
                      <span className={`text-sm font-black ${admin.role === "Super Admin" ? "text-gray-900" : "text-gray-600"}`}>
                        {admin.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      admin.status === "Active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {admin.status === "Active" && <CheckCircle size={12} />}
                      {admin.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-500">{admin.lastActive}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRemoveAdmin(admin.id, admin.name)}
                        className="p-2.5 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors cursor-pointer font-bold text-xs flex items-center gap-1"
                        title="Remove Member"
                      >
                        <Trash2 size={16} /> Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 z-50 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-black uppercase text-gray-900">Invite New Admin</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="font-bold text-gray-400 hover:text-gray-900 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleInviteAdmin} className="space-y-4 text-sm font-medium">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Samantha Vance"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Work Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="samantha@everace.com"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Assigned Security Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-[#facc15] outline-none font-bold"
                >
                  <option value="Catalog Manager">Catalog Manager (Products, Inventory)</option>
                  <option value="Support Lead">Support Lead (Orders, Reviews)</option>
                  <option value="Marketing Specialist">Marketing Specialist (Coupons, Banners)</option>
                  <option value="Super Admin">Super Admin (Full Access)</option>
                </select>
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
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
