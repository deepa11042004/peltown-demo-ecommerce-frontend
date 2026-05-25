"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Package, ShoppingBag, Warehouse, Tag, Star, Image as ImageIcon, ShieldAlert, Settings, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const isAdminRole = (role?: string | null) => {
  if (!role) {
    return false;
  }

  const normalizedRole = role.toLowerCase();
  return normalizedRole === "admin" || normalizedRole === "super_admin";
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const pathname = usePathname() || "";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAdminLoginRoute = pathname === "/admin/login";
  const hasAdminAccess = isAuthenticated && isAdminRole(user?.role);

  useEffect(() => {
    if (isAdminLoginRoute || loading) {
      return;
    }

    if (!hasAdminAccess) {
      router.replace("/admin/login");
    }
  }, [hasAdminAccess, isAdminLoginRoute, loading, router]);

  if (isAdminLoginRoute) {
    return <>{children}</>;
  }

  if (loading || !hasAdminAccess) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#facc15]/40 border-t-[#facc15] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest text-white/80">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  const isProductsActive = pathname.startsWith("/admin/products");
  const isOrdersActive = pathname.startsWith("/admin/orders");
  const isInventoryActive = pathname.startsWith("/admin/inventory");
  const isCouponsActive = pathname.startsWith("/admin/coupons");
  const isReviewsActive = pathname.startsWith("/admin/reviews");
  const isBannersActive = pathname.startsWith("/admin/banners");
  const isAdminsActive = pathname.startsWith("/admin/admins");
  const isSettingsActive = pathname.startsWith("/admin/settings");
  const isUsersActive = pathname.startsWith("/admin/users");
  const isDashboardActive = pathname === "/admin";

  const getPageTitle = () => {
    if (pathname.includes("/products/add")) return "Add Product";
    if (isProductsActive) return "Products";
    if (isOrdersActive) return "Orders";
    if (isInventoryActive) return "Inventory";
    if (isCouponsActive) return "Coupons";
    if (isReviewsActive) return "Reviews";
    if (isBannersActive) return "Banners";
    if (isAdminsActive) return "Admins";
    if (isSettingsActive) return "Settings";
    if (isUsersActive) return "Users";
    return "Dashboard";
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 relative overflow-hidden">
      {/* Mobile/Tablet Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Responsive Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <span className="font-black text-xl tracking-tight uppercase">Everace Admin</span>
          <button
            onClick={closeSidebar}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 lg:hidden cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <div className="px-3 py-1.5 text-[10px] font-black tracking-widest text-gray-400 uppercase">E-Commerce</div>
            <li>
              <Link
                href="/admin"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                  isDashboardActive
                    ? "bg-[#facc15] text-black shadow-md font-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/products"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                  isProductsActive
                    ? "bg-[#facc15] text-black shadow-md font-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <Package size={18} />
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/admin/inventory"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                  isInventoryActive
                    ? "bg-[#facc15] text-black shadow-md font-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <Warehouse size={18} />
                Inventory
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                  isOrdersActive
                    ? "bg-[#facc15] text-black shadow-md font-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <ShoppingBag size={18} />
                Orders
              </Link>
            </li>
            <li>
              <Link
                href="/admin/coupons"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                  isCouponsActive
                    ? "bg-[#facc15] text-black shadow-md font-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <Tag size={18} />
                Coupons
              </Link>
            </li>
            <li>
              <Link
                href="/admin/reviews"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                  isReviewsActive
                    ? "bg-[#facc15] text-black shadow-md font-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <Star size={18} />
                Reviews
              </Link>
            </li>

            <div className="pt-4 px-3 py-1.5 text-[10px] font-black tracking-widest text-gray-400 uppercase">Management</div>
            <li>
              <Link
                href="/admin/banners"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                  isBannersActive
                    ? "bg-[#facc15] text-black shadow-md font-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <ImageIcon size={18} />
                Banners
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                  isUsersActive
                    ? "bg-[#facc15] text-black shadow-md font-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <Users size={18} />
                Users
              </Link>
            </li>
            <li>
              <Link
                href="/admin/admins"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                  isAdminsActive
                    ? "bg-[#facc15] text-black shadow-md font-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <ShieldAlert size={18} />
                Admins
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                  isSettingsActive
                    ? "bg-[#facc15] text-black shadow-md font-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <Settings size={18} />
                Settings
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link
            href="/"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 font-bold text-sm transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Admin Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shadow-xs z-30">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 lg:hidden cursor-pointer rounded-lg hover:bg-gray-100 transition-colors"
              title="Open Navigation Menu"
            >
              <Menu size={24} />
            </button>
            <div className="h-8 w-1 bg-[#facc15] rounded-full hidden sm:block" />
            <h1 className="font-black text-lg sm:text-xl tracking-tight uppercase truncate">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-900 rounded-full flex items-center justify-center text-[#facc15] font-black text-xs sm:text-sm border-2 border-gray-100 shadow-sm">
              {(user?.firstName?.[0] || user?.email?.[0] || "A").toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
