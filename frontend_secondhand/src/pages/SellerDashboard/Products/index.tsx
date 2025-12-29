import React, { useState } from "react";
import SellerLayout from "../components/SellerLayout";
// --- TYPES ---
type ProductStatus = "active" | "pending" | "violation" | "draft" | "hidden";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  violationReason?: string;
  imageUrl: string;
};

// --- MOCK DATA (Giống hình ảnh) ---
const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Áo khoác Denim Vintage size M - Hàng tuyển",
    sku: "VINT-001",
    category: "Áo khoác",
    price: 250000,
    stock: 1,
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1605908502724-9093a79a1b39?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: "2",
    name: "Giày Boots da thật size 42 - Độ mới 98%",
    sku: "SHOE-921",
    category: "Giày dép",
    price: 850000,
    stock: 1,
    status: "pending",
    imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: "3",
    name: "Túi xách da cá sấu (Hàng hiệu auth)",
    sku: "BAG-003",
    category: "Phụ kiện",
    price: 1200000,
    stock: 1,
    status: "violation",
    violationReason: "Hàng giả/nhái",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: "4",
    name: "Áo thun trắng basic Uniqlo - Lỗi nhẹ",
    sku: "UNI-099",
    category: "Quần áo",
    price: 90000,
    stock: 3,
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: "5",
    name: "Khăn lụa tơ tằm handmade",
    sku: "SILK-002",
    category: "Phụ kiện",
    price: 350000,
    stock: 1,
    status: "hidden",
    imageUrl: "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa3e?auto=format&fit=crop&q=80&w=100"
  },
];

const TABS = [
  { id: "all", label: "Tất cả", count: 120 },
  { id: "active", label: "Đang hoạt động", count: 85 },
  { id: "pending", label: "Chờ duyệt", count: 10 },
  { id: "violation", label: "Vi phạm", count: 2 },
  { id: "draft", label: "Nháp", count: 23 },
];

// --- HELPER COMPONENTS ---

// 1. Status Badge
const StatusBadge = ({ status, reason }: { status: ProductStatus; reason?: string }) => {
  const styles = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    violation: "bg-red-100 text-red-700 border-red-200",
    draft: "bg-gray-100 text-gray-700 border-gray-200",
    hidden: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const labels = {
    active: "Đang hiện",
    pending: "Chờ duyệt",
    violation: "Vi phạm",
    draft: "Nháp",
    hidden: "Đã ẩn",
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
        {labels[status]}
      </span>
      {status === "violation" && reason && (
        <span className="text-[10px] text-red-500 font-medium">{reason}</span>
      )}
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function SellerProductsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const formatVND = (price: number) => new Intl.NumberFormat("vi-VN").format(price);

  return (
    <SellerLayout>
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Danh sách sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý kho hàng, cập nhật giá và trạng thái sản phẩm</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm sản phẩm mới
        </button>
      </div>

      {/* 2. MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* TABS */}
        <div className="border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
          <div className="flex px-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-4 border-b-2 text-sm font-bold whitespace-nowrap transition-colors
                  ${activeTab === tab.id 
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" 
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }
                `}
              >
                {tab.label}
                <span className={`
                  px-1.5 py-0.5 rounded text-[10px] 
                  ${activeTab === tab.id 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" 
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }
                `}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* FILTERS */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
          {/* Search */}
          <div className="lg:col-span-5 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên sản phẩm, SKU..." 
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          
          {/* Category Filter */}
          <div className="lg:col-span-3">
            <select className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:border-emerald-500">
              <option>Tất cả danh mục</option>
              <option>Quần áo</option>
              <option>Giày dép</option>
              <option>Phụ kiện</option>
            </select>
          </div>

          {/* Sort */}
          <div className="lg:col-span-2">
            <select className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm outline-none focus:border-emerald-500">
              <option>Sắp xếp giá</option>
              <option>Cao đến thấp</option>
              <option>Thấp đến cao</option>
            </select>
          </div>

          {/* Clear Filter */}
          <div className="lg:col-span-2">
             <button className="w-full h-10 flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors">
                <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                Xóa lọc
             </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs font-bold border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="p-4 w-10">
                  <input type="checkbox" className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                </th>
                <th className="p-4">Sản phẩm</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Giá bán (VNĐ)</th>
                <th className="p-4 text-center">Tồn kho</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
              {PRODUCTS.map((product) => (
                <tr key={product.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 bg-gray-100">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 max-w-[250px]">
                        <div className="font-bold text-gray-900 dark:text-white truncate" title={product.name}>
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">SKU: {product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">{product.category}</td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{formatVND(product.price)}</td>
                  <td className="p-4 text-center text-gray-600 dark:text-gray-300">{product.stock}</td>
                  <td className="p-4">
                    <StatusBadge status={product.status} reason={product.violationReason} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600" title="Chỉnh sửa">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600" title="Xóa">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                      <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700" title="Khác">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Hiển thị <span className="font-bold text-gray-900 dark:text-white">1-5</span> trong số <span className="font-bold text-gray-900 dark:text-white">120</span> sản phẩm
          </span>
          
          <div className="flex items-center gap-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 bg-white dark:bg-gray-800 disabled:opacity-50">
               <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-sm shadow-md">1</button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm">2</button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm">3</button>
            <span className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">...</span>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm">24</button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 bg-white dark:bg-gray-800">
               <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>

      </div>
    </div>
    </SellerLayout>
  );
}