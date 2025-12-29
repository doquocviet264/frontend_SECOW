import React, { useState, useEffect, useRef } from 'react';
import type { CategoryModel, FilterState } from '../types';

interface FiltersSidebarProps {
  filters: FilterState;
  categories: CategoryModel[]; // Truyền danh mục cha con vào đây
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onClearFilters: () => void;
}

export default function FiltersSidebar({ filters, categories, onFilterChange, onClearFilters }: FiltersSidebarProps) {
  // --- LOGIC SLIDER KÉO THẢ ---
  const minLimit = 0;
  const maxLimit = 50000000;
  const [tempPrice, setTempPrice] = useState(filters.priceRange);

  // Cập nhật local state khi props thay đổi (ví dụ khi ấn nút Clear)
  useEffect(() => {
    setTempPrice(filters.priceRange);
  }, [filters.priceRange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const val = parseInt(e.target.value);
    if (type === 'min') {
      const newMin = Math.min(val, tempPrice.max - 1000000); // Không cho min vượt quá max
      setTempPrice({ ...tempPrice, min: newMin });
    } else {
      const newMax = Math.max(val, tempPrice.min + 1000000); // Không cho max thấp hơn min
      setTempPrice({ ...tempPrice, max: newMax });
    }
  };

  const applyPrice = () => {
    onFilterChange({ priceRange: tempPrice });
  };

  // --- LOGIC DANH MỤC ĐA CẤP ---
  const toggleCategory = (catId: string) => {
    const current = filters.categoryIds;
    const isSelected = current.includes(catId);
    let newIds = [];
    if (isSelected) {
      newIds = current.filter(id => id !== catId);
    } else {
      newIds = [...current, catId];
    }
    onFilterChange({ categoryIds: newIds });
  };

  // Render đệ quy danh mục
  const renderCategory = (cat: CategoryModel, level = 0) => {
    return (
      <div key={cat.id} className="w-full">
        <label className={`flex items-center gap-2 cursor-pointer py-1.5 hover:text-blue-600 transition-colors ${level > 0 ? 'pl-6' : ''}`}>
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={filters.categoryIds.includes(cat.id)}
            onChange={() => toggleCategory(cat.id)}
          />
          <span className={`text-sm ${level === 0 ? 'font-medium' : 'text-gray-600'}`}>
            {cat.name}
          </span>
          {cat.count && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full ml-auto">{cat.count}</span>}
        </label>
        {/* Đệ quy render con */}
        {cat.children && cat.children.map(child => renderCategory(child, level + 1))}
      </div>
    );
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
      
      {/* NÚT XÓA LỌC */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
          Bộ lọc
        </h3>

        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 
                    px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10
                    transition"
        >
          <span className="material-symbols-outlined text-[18px]">
            restart_alt
          </span>
          Xóa lọc
        </button>
      </div>


      {/* DANH MỤC ĐA CẤP */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h4 className="font-bold text-gray-900 dark:text-white mb-3">Danh mục</h4>
        <div className="space-y-1">
          {categories.map(cat => renderCategory(cat))}
        </div>
      </div>

      {/* KHOẢNG GIÁ (Range Slider) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Khoảng giá</h4>
        
        {/* Slider Visual */}
        <div className="relative h-12 mb-2">
           {/* Track nền */}
           <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full -translate-y-1/2"></div>
           {/* Track màu (Khoảng giữa min và max) */}
           <div 
             className="absolute top-1/2 h-1 bg-blue-600 rounded-full -translate-y-1/2"
             style={{
               left: `${(tempPrice.min / maxLimit) * 100}%`,
               right: `${100 - (tempPrice.max / maxLimit) * 100}%`
             }}
           ></div>

           {/* Input Min (Vô hình nhưng kéo được) */}
           <input 
             type="range" min={minLimit} max={maxLimit} step={500000}
             value={tempPrice.min}
             onChange={(e) => handleSliderChange(e, 'min')}
             className="absolute pointer-events-none appearance-none bg-transparent w-full h-full top-0 left-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer z-10"
           />
           {/* Input Max */}
           <input 
             type="range" min={minLimit} max={maxLimit} step={500000}
             value={tempPrice.max}
             onChange={(e) => handleSliderChange(e, 'max')}
             className="absolute pointer-events-none appearance-none bg-transparent w-full h-full top-0 left-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer z-20"
           />
        </div>

        {/* Hiển thị số tiền */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>{(tempPrice.min / 1000000).toFixed(1)}tr</span>
          <span>{(tempPrice.max / 1000000).toFixed(1)}tr</span>
        </div>
        
        <button onClick={applyPrice} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm text-sm">
          Áp dụng
        </button>
      </div>

      {/* KHU VỰC */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h4 className="font-bold text-gray-900 dark:text-white mb-3">Khu vực</h4>
        <div className="space-y-2">
          {["Hà Nội", "TP. HCM", "Đà Nẵng", "Cần Thơ"].map((loc) => (
            <label key={loc} className="flex items-center gap-3 cursor-pointer group">
               <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={filters.locations.includes(loc)}
                onChange={() => {
                  const newLocs = filters.locations.includes(loc) 
                    ? filters.locations.filter(l => l !== loc) 
                    : [...filters.locations, loc];
                  onFilterChange({ locations: newLocs });
                }}
              />
              <span className="text-sm group-hover:text-blue-600">{loc}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}