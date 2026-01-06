import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { storeService } from "@/services/storeService";
import type { Store } from "@/services/storeService";
import { messageService } from "@/services/messageService";
import { getSocket } from "@/config/socket";
import { authService } from "@/services/authService";

const MENU_ITEMS = [
  { path: "/seller/dashboard", icon: "dashboard", label: "Tổng quan" },
  { path: "/seller/products", icon: "inventory_2", label: "Sản phẩm" },
  { path: "/seller/orders", icon: "shopping_bag", label: "Đơn hàng" },
  { path: "/seller/reviews", icon: "rate_review", label: "Đánh giá" },
  { path: "/chat", icon: "forum", label: "Tin nhắn", isChat: true },
  { path: "/seller/settings", icon: "settings", label: "Thiết lập Shop" },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await storeService.getMyStore();
        if (response.success && response.data?.store) {
          setStore(response.data.store);
        }
      } catch (error) {
        console.error("Error fetching store:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadUnread = async () => {
      try {
        const res = await messageService.getConversations();
        const total = (res.conversations || []).reduce((s, c: any) => s + (c.unreadCount || 0), 0);
        if (mounted) setUnread(total);
      } catch {}
    };
    loadUnread();

    // Listen realtime to update unread
    const socket = getSocket();
    const refresh = () => loadUnread();
    socket.on("message:new", refresh);
    socket.on("message:read", refresh);
    socket.on("conversation:updated", refresh);
    return () => {
      mounted = false;
      socket.off("message:new", refresh);
      socket.off("message:read", refresh);
      socket.off("conversation:updated", refresh);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full z-10 hidden md:flex flex-col">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 font-black text-xl text-emerald-600">
            <span className="material-symbols-outlined filled">eco</span>
            Seller Center
          </div>
        </div>

        {/* User Profile Mini */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
           <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                 {loading ? (
                   <div className="w-full h-full bg-gray-300 animate-pulse" />
                 ) : (
                   <img 
                     src={store?.logo || "https://via.placeholder.com/150"} 
                     alt={store?.storeName || "Shop"} 
                     className="w-full h-full object-cover"
                   />
                 )}
              </div>
              <div className="min-w-0">
                 <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                   {loading ? (
                     <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
                   ) : (
                     store?.storeName || "Chưa có shop"
                   )}
                 </div>
                 <div className="text-xs text-emerald-600 font-medium">
                   {store?.isApproved ? "Đang hoạt động" : "Chờ duyệt"}
                 </div>
              </div>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 relative">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${isActive ? 'filled' : ''}`}>
                   {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.isChat && unread > 0 ? (
                  <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px]">
                    {unread}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
           <Link
              to="/"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
           >
              <span className="material-symbols-outlined">home</span>
              Quay về trang chủ
           </Link>
           <button 
             onClick={() => authService.logout()}
             className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
           >
              <span className="material-symbols-outlined">logout</span>
              Đăng xuất
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 overflow-x-hidden">
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
              <span className="hidden sm:inline">Quay về trang chủ</span>
            </Link>
          </div>
          
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}