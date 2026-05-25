"use client";
import React from "react";
import { Search, UserPlus, Shield, ShieldCheck, UserX, UserCheck } from "lucide-react";

const users = [
  {
    id: 1,
    name: "Akash Admin",
    email: "akash@example.com",
    role: "Admin",
    status: "Active",
    joined: "May 10, 2026",
    avatar: "AS",
  },
  {
    id: 2,
    name: "rohit Sharma",
    email: "rohit@example.com",
    role: "User",
    status: "Active",
    joined: "May 12, 2026",
    avatar: "RS",
  },
  {
    id: 3,
    name: "John Doe",
    email: "john@doe.com",
    role: "User",
    status: "Inactive",
    joined: "Apr 20, 2026",
    avatar: "JD",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@wilson.com",
    role: "User",
    status: "Banned",
    joined: "May 14, 2026",
    avatar: "SW",
  },
];

export default function AdminUsers() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Users</h2>
          <p className="text-gray-500 font-medium text-sm">Monitor and manage user accounts and permissions.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-gray-900 text-[#facc15] px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-[#facc15]/20">
          <UserPlus size={18} />
          Invite User
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#facc15] outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="flex-1 md:flex-none bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[#facc15] outline-none cursor-pointer">
            <option>All Roles</option>
            <option>Admin</option>
            <option>User</option>
          </select>
          <select className="flex-1 md:flex-none bg-gray-50 border-none rounded-2xl py-3 px-6 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-[#facc15] outline-none cursor-pointer">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-4xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">User</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Role</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Joined Date</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-[#facc15] font-black text-sm border-2 border-gray-100 shadow-sm">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 uppercase tracking-tight leading-none">{user.name}</p>
                        <p className="text-xs font-bold text-gray-400 mt-1">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      {user.role === "Admin" ? (
                        <ShieldCheck className="text-[#facc15]" size={16} />
                      ) : (
                        <Shield className="text-gray-400" size={16} />
                      )}
                      <span className={`text-sm font-bold ${user.role === "Admin" ? "text-gray-900" : "text-gray-500"}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-gray-500">{user.joined}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      user.status === "Active" ? "bg-green-100 text-green-700" :
                      user.status === "Inactive" ? "bg-gray-100 text-gray-500" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-colors cursor-pointer" title="Manage Account">
                        <UserCheck size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors cursor-pointer" title="Suspend User">
                        <UserX size={18} />
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
