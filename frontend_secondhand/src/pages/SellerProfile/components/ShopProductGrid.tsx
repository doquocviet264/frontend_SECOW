import { useState } from "react";
import type { ProductItem } from "../types";

type Props = {
  products: ProductItem[];
  newestProducts: ProductItem[];
  bestSellingProducts: ProductItem[];
};

const formatVND = (v: number) => new Intl.NumberFormat("vi-VN").format(v) + "₫";

type TabType = "all" | "newest" | "bestselling";

export default function ShopProductGrid({ products, newestProducts, bestSellingProducts }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const getDisplayProducts = () => {
    switch (activeTab) {
      case "newest":
        return newestProducts;
      case "bestselling":
        return bestSellingProducts;
      default:
        return products;
    }
  };

  const displayProducts = getDisplayProducts();

  const tabs = [
    { key: "all" as TabType, label: "Tất cả sản phẩm" },
    { key: "newest" as TabType, label: "Mới nhất" },
    { key: "bestselling" as TabType, label: "Bán chạy" },
  ];

  return (
    <div>
      {/* 1. Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">
        {/* Tabs */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar items-center">
          {tabs.map((tab) => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key 
                  ? "text-emerald-500 border-emerald-500" 
                  : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown Trigger */}
        <button className="flex items-center gap-1 text-sm text-gray-500 font-medium hover:text-emerald-600 transition-colors">
           Sắp xếp: <span className="text-gray-900 dark:text-white font-bold">Giá: Thấp đến Cao</span>
           <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </button>
      </div>

      {/* 2. Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">inventory_2</span>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === "newest" 
                ? "Chưa có sản phẩm mới nhất" 
                : activeTab === "bestselling"
                ? "Chưa có sản phẩm bán chạy"
                : "Chưa có sản phẩm nào"}
            </p>
          </div>
        ) : (
          displayProducts.map((p) => (
          <div key={p.id} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
             
             {/* Image Area */}
             <div className="aspect-[4/5] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                
                {/* Badge (Top Left) */}
                {p.badge && (
                  <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {p.badge}
                  </span>
                )}
                
                {/* Sold Overlay */}
                {p.status === 'sold' && (
                   <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">ĐÃ BÁN</span>
                   </div>
                )}
             </div>

             {/* Content */}
             <div className="p-4">
               <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 min-h-[40px] mb-2 group-hover:text-emerald-600 transition-colors">
                 {p.title}
               </h3>
               
               <div className="space-y-1">
                 <div className="flex items-center gap-2">
                   <span className="text-lg font-bold text-emerald-500">{formatVND(p.price)}</span>
                   {p.originalPrice && (
                     <span className="text-xs text-gray-400 line-through">{formatVND(p.originalPrice)}</span>
                   )}
                 </div>
                 
                 <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-50 dark:border-gray-700/50 mt-2">
                    <span>{p.condition}</span>
                    <span>{p.postedTime}</span>
                 </div>
               </div>
             </div>
          </div>
          ))
        )}
      </div>

      {/* 3. Pagination */}
      <div className="flex justify-center items-center gap-2 mt-10">
          <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-white bg-white dark:bg-gray-800">
             <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20">1</button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-transparent hover:bg-white dark:hover:bg-gray-800 text-gray-500 text-sm">2</button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-transparent hover:bg-white dark:hover:bg-gray-800 text-gray-500 text-sm">3</button>
          <span className="text-gray-400 text-sm">...</span>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-white bg-white dark:bg-gray-800">
             <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
    </div>
  );
}