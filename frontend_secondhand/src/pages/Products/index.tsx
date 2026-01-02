import { useState, useMemo } from 'react' // Bỏ useEffect
import FiltersSidebar from './components/FiltersSidebar'
import ProductsToolbar from './components/ProductsToolbar'
import ProductsGrid from './components/ProductsGrid'
import type { ProductModel, CategoryModel, FilterState, ViewMode } from './type'
import PageLayout from '@/components/layout/PageLayout'

// 1. Import Hook thay vì gọi hàm API trực tiếp
import { useProductRequest } from './hooks/UseProductRequest' // Sửa đường dẫn nếu file hook nằm ở folder khác (vd: ./hooks/UseProductRequest)

const CATEGORY_TREE: CategoryModel[] = [
	{
		id: 'phones',
		name: 'Điện thoại',
		count: 120,
		children: [
			{ id: 'ios', name: 'iPhone (iOS)', count: 80 },
			{ id: 'android', name: 'Android', count: 40 }
		]
	},
	{
		id: 'laptops',
		name: 'Máy tính xách tay',
		count: 50,
		children: [
			{ id: 'laptop_gaming', name: 'Gaming', count: 20 },
			{ id: 'laptop_office', name: 'Văn phòng', count: 30 }
		]
	}
]

export default function ProductListingPage() {
	// --- SỬ DỤNG REACT QUERY HOOK ---
	// data: đổi tên thành products, gán mặc định là [] nếu data chưa về (undefined)
	const { data: products = [], isLoading } = useProductRequest()
	// --------------------------------

	const [viewMode, setViewMode] = useState<ViewMode>('grid')
	const [sortOption, setSortOption] = useState('newest')
	const [currentPage, setCurrentPage] = useState(1)
	const ITEMS_PER_PAGE = 6

	const [filters, setFilters] = useState<FilterState>({
		categoryIds: [],
		locations: [],
		conditions: [],
		priceRange: { min: 0, max: 50000000 }
	})

	// ĐÃ XÓA useEffect và fetchData thủ công ở đây

	const clearFilters = () => {
		setFilters({
			categoryIds: [],
			locations: [],
			conditions: [],
			priceRange: { min: 0, max: 50000000 }
		})
		setCurrentPage(1)
	}

	const updateFilters = (newFilters: Partial<FilterState>) => {
		setFilters((prev) => ({ ...prev, ...newFilters }))
		setCurrentPage(1)
	}

	const filteredData = useMemo(() => {
		// Ép kiểu dữ liệu từ API sang Model hiển thị
		// products bây giờ lấy trực tiếp từ React Query, mặc định là [] nên an toàn để spread (...)
		let res = [...products] as unknown as ProductModel[]

		if (filters.categoryIds.length > 0) {
			res = res.filter((p) => filters.categoryIds.includes(p.categoryId))
		}

		if (filters.locations.length > 0) {
			res = res.filter((p) => filters.locations.includes(p.location))
		}

		res = res.filter(
			(p) =>
				p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
		)

		if (sortOption === 'price_asc') res.sort((a, b) => a.price - b.price)
		if (sortOption === 'price_desc') res.sort((a, b) => b.price - a.price)

		return res
	}, [filters, sortOption, products]) // products thay đổi khi React Query fetch xong -> trigger lại useMemo

	const currentItems = filteredData.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	)
	const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)

	return (
		<PageLayout>
			<main className="max-w-7xl mx-auto px-4 py-8">
				{/* HIỂN THỊ LOADING TỪ HOOK */}
				{isLoading ? (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					</div>
				) : (
					<div className="flex flex-col lg:flex-row gap-8">
						{/* SIDEBAR */}
						<FiltersSidebar
							filters={filters}
							categories={CATEGORY_TREE}
							onFilterChange={updateFilters}
							onClearFilters={clearFilters}
						/>

						<div className="flex-1 min-w-0">
							{/* TOOLBAR */}
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
									<button
										onClick={clearFilters}
										className="text-blue-600 font-bold mt-2"
									>
										Xóa bộ lọc
									</button>
								</div>
							)}
						</div>
					</div>
				)}
			</main>
		</PageLayout>
	)
}
