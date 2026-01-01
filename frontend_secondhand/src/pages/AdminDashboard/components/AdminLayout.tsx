import React from "react";
import { Link, useLocation } from "react-router-dom";

const MENU_ITEMS = [
  { path: "/admin", icon: "dashboard", label: "Tổng quan" },
  { path: "/admin/users", icon: "group", label: "Người dùng" },
  { path: "/admin/sellers", icon: "storefront", label: "Người bán" },
  { path: "/admin/products-approval", icon: "inventory_2", label: "Phê duyệt sản phẩm" },
  { path: "/admin/categories", icon: "category", label: "Danh mục sản phẩm" },
  { path: "/admin/orders", icon: "receipt_long", label: "Đơn hàng" },
  { path: "/admin/reports", icon: "report", label: "Báo cáo và Khiếu nại" },
  { path: "/admin/settings", icon: "settings", label: "Cài đặt hệ thống" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full z-10 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 font-black text-xl text-emerald-600">
            <span className="material-symbols-outlined filled">admin_panel_settings</span>
            Admin Portal
          </div>
        </div>

        {/* User Profile Mini */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
           <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                 AD
              </div>
              <div className="min-w-0">
                 <div className="font-bold text-sm text-gray-900 dark:text-white truncate">Administrator</div>
                 <div className="text-xs text-emerald-600 font-medium">Super Admin</div>
              </div>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg shadow-gray-200 dark:shadow-none"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${isActive ? 'filled' : ''}`}>
                   {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
           <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <span className="material-symbols-outlined">logout</span>
              Đăng xuất
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 p-6 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}