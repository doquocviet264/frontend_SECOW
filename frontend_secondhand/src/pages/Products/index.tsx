import { useState, useMemo } from 'react';
import FiltersSidebar from "./components/FiltersSidebar";
import ProductsToolbar from "./components/ProductsToolbar";
import ProductsGrid from "./components/ProductsGrid";
import type { ProductModel, CategoryModel, FilterState, ViewMode } from './types';
import PageLayout from '@/components/layout/PageLayout';  

const MOCK_DATA: ProductModel[] = [
  {
    id: "1", title: "iPhone 14 Pro Max", priceText: "24.500.000 đ", price: 24500000,
    imageUrl: "https://placehold.co/400x300", condition: "Like New", conditionColor: "primary",
    sellerName: "Shop Apple", location: "Hà Nội", categoryId: "ios", timeAgo: "1h trước"
  },
  {
    id: "2", title: "Samsung S23 Ultra", priceText: "19.200.000 đ", price: 19200000,
    imageUrl: "https://placehold.co/400x300", condition: "Tốt", conditionColor: "blue",
    sellerName: "Huy Mobile", location: "TP. HCM", categoryId: "android", timeAgo: "2h trước"
  },
  {
    id: "3", title: "MacBook Air M1", priceText: "15.000.000 đ", price: 15000000,
    imageUrl: "https://placehold.co/400x300", condition: "Like New", conditionColor: "primary",
    sellerName: "Táo Xanh", location: "Đà Nẵng", categoryId: "laptop_office", timeAgo: "1 ngày trước"
  },
];

const CATEGORY_TREE: CategoryModel[] = [
  {
    id: "phones", name: "Điện thoại", count: 120,
    children: [
      { id: "ios", name: "iPhone (iOS)", count: 80 },
      { id: "android", name: "Android", count: 40 },
    ]
  },
  {
    id: "laptops", name: "Máy tính xách tay", count: 50,
    children: [
      { id: "laptop_gaming", name: "Gaming", count: 20 },
      { id: "laptop_office", name: "Văn phòng", count: 30 },
    ]
  }
];

export default function ProductListingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const [filters, setFilters] = useState<FilterState>({
    categoryIds: [],
    locations: [],
    conditions: [],
    priceRange: { min: 0, max: 50000000 }
  });

  const clearFilters = () => {
    setFilters({
      categoryIds: [],
      locations: [],
      conditions: [],
      priceRange: { min: 0, max: 50000000 }
    });
    setCurrentPage(1);
  };

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    let res = [...MOCK_DATA];

    if (filters.categoryIds.length > 0) {
      res = res.filter(p => filters.categoryIds.includes(p.categoryId));
    }

    if (filters.locations.length > 0) {
      res = res.filter(p => filters.locations.includes(p.location));
    }
    
    res = res.filter(p => p.price >= filters.priceRange.min && p.price <= filters.priceRange.max);

    if (sortOption === "price_asc") res.sort((a, b) => a.price - b.price);
    if (sortOption === "price_desc") res.sort((a, b) => b.price - a.price);

    return res;
  }, [filters, sortOption]);

  const currentItems = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR MỚI */}
          <FiltersSidebar 
            filters={filters}
            categories={CATEGORY_TREE}
            onFilterChange={updateFilters}
            onClearFilters={clearFilters}
          />

          <div className="flex-1 min-w-0">
            {/* TOOLBAR MỚI (Có nút Grid/List) */}
            <ProductsToolbar 
              totalCount={filteredData.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortOption={sortOption}
              onSortChange={setSortOption}
            />

            {currentItems.length > 0 ? (
              <ProductsGrid 
                items={currentItems}
                viewMode={viewMode}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <p className="text-gray-500">Không tìm thấy sản phẩm nào.</p>
                <button onClick={clearFilters} className="text-blue-600 font-bold mt-2">Xóa bộ lọc</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </PageLayout>
  );
}