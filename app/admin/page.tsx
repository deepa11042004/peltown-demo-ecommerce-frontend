import React from "react";
import Link from "next/link";
import { Package, ShoppingBag, Users, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Sales", value: "₹24,500", icon: <TrendingUp size={24} />, trend: "+12%" },
    { title: "Active Users", value: "1,250", icon: <Users size={24} />, trend: "+5%" },
    { title: "Total Products", value: "85", icon: <Package size={24} />, trend: "0%" },
    { title: "New Orders", value: "32", icon: <ShoppingBag size={24} />, trend: "+25%" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
              <p className={`text-xs font-bold mt-2 ${stat.trend.startsWith("+") ? "text-green-600" : "text-gray-400"}`}>
                {stat.trend} from last month
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-gray-700">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm font-bold text-[#facc15] bg-black px-3 py-1.5 rounded-lg hover:bg-gray-900 transition-colors">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { id: "#ORD-001", customer: "John Doe", date: "May 15, 2026", amount: "₹120.00", status: "Completed" },
                  { id: "#ORD-002", customer: "Jane Smith", date: "May 14, 2026", amount: "₹45.50", status: "Processing" },
                  { id: "#ORD-003", customer: "Michael Brown", date: "May 14, 2026", amount: "₹89.99", status: "Pending" },
                  { id: "#ORD-004", customer: "Sarah Wilson", date: "May 13, 2026", amount: "₹210.00", status: "Completed" },
                ].map((order, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-medium">{order.id}</td>
                    <td className="py-4 text-gray-600">{order.customer}</td>
                    <td className="py-4 text-gray-500">{order.date}</td>
                    <td className="py-4 font-semibold">{order.amount}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === "Completed" ? "bg-green-100 text-green-700" :
                        order.status === "Processing" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/admin/products/add" className="w-full py-3 px-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors text-left flex justify-between items-center cursor-pointer">
              Add New Product
              <Package size={16} />
            </Link>
            <Link href="/admin/orders" className="w-full py-3 px-4 bg-[#facc15] text-black font-black rounded-xl text-sm hover:bg-[#facc15]/90 transition-colors text-left flex justify-between items-center cursor-pointer shadow-sm">
              Manage Orders
              <ShoppingBag size={16} />
            </Link>
            <Link href="/admin/users" className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors text-left flex justify-between items-center cursor-pointer">
              Manage Users
              <Users size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
