import React from 'react';
import type { ProductModel, ViewMode } from '../types';

interface ProductCardProps {
  item: ProductModel;
  viewMode: ViewMode;
}

const conditionColors: Record<string, string> = {
  primary: "bg-blue-600",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  gray: "bg-gray-500",
};

export default function ProductCard({ item, viewMode }: ProductCardProps) {
  const isList = viewMode === 'list';

  return (
    <div className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-100 dark:hover:border-gray-700 flex ${isList ? 'flex-row h-48' : 'flex-col h-full'}`}>
      
      {/* ẢNH SẢN PHẨM */}
      <div className={`relative overflow-hidden bg-gray-100 ${isList ? 'w-48 shrink-0' : 'h-56 w-full'}`}>
        <img
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
        />
        
        {/* Badge Tình trạng */}
        <div className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase shadow-sm ${conditionColors[item.conditionColor] || "bg-gray-500"}`}>
          {item.condition}
        </div>

        {/* Nút Like */}
        <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:text-red-500 text-gray-400">
          <span className="material-symbols-outlined text-lg">{item.isLiked ? 'favorite' : 'favorite_border'}</span>
        </button>
      </div>

      {/* THÔNG TIN SẢN PHẨM */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 cursor-pointer mb-1">
            {item.title}
          </h3>
          <div className="text-lg font-bold text-red-600">{item.priceText}</div>
          
          {/* Mô tả thêm nếu ở chế độ List */}
          {isList && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              Sản phẩm chính hãng, bao test 7 ngày. Liên hệ ngay để ép giá...
            </p>
          )}
        </div>

        <div className={`flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 ${isList ? 'mt-2' : 'mt-auto'}`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold uppercase">
              {item.sellerName.charAt(0)}
            </div>
            <span className="text-xs text-gray-500 truncate max-w-[100px]">{item.sellerName}</span>
          </div>
          <div className="text-[11px] text-gray-400 flex flex-col items-end">
            <span>{item.location}</span>
            <span>{item.timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}