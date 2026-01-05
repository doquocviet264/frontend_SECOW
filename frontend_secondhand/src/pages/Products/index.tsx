import { useState, useMemo } from 'react' // Bỏ useEffect
import FiltersSidebar from './components/FiltersSidebar'
import ProductsToolbar from './components/ProductsToolbar'
import ProductsGrid from './components/ProductsGrid'
import type { ProductModel, CategoryModel, FilterState, ViewMode } from './type'
import PageLayout from '@/components/layout/PageLayout'

// 1. Import Hook thay vì gọi hàm API trực tiếp
import { useProductRequest } from './hooks/UseProductRequest' // Sửa đường dẫn nếu file hook nằm ở folder khác (vd: ./hooks/UseProductRequest)
import { useCategories } from './hooks/useCategories'

export default function ProductListingPage() {
	// --- SỬ DỤNG REACT QUERY HOOK ---
	// data: đổi tên thành products, gán mặc định là [] nếu data chưa về (undefined)
	const { data: products = [], isLoading, isError } = useProductRequest()
	// Load danh mục từ API
	const { data: categories = [], isLoading: isLoadingCategories } = useCategories()
	// --------------------------------

	const [viewMode, setViewMode] = useState<ViewMode>('grid')
	const [sortOption, setSortOption] = useState('newest')
	const [currentPage, setCurrentPage] = useState(1)
	const ITEMS_PER_PAGE = 6

	const [filters, setFilters] = useState<FilterState>({
		categoryIds: [],
		locations: [],
		conditions: [],
		priceRange: { min: 0, max: 50000000 },
		selectedCity: '',
		selectedDistrict: ''
	})

	// ĐÃ XÓA useEffect và fetchData thủ công ở đây

	const clearFilters = () => {
		setFilters({
			categoryIds: [],
			locations: [],
			conditions: [],
			priceRange: { min: 0, max: 50000000 },
			selectedCity: '',
			selectedDistrict: ''
		})
		setCurrentPage(1)
	}

	const updateFilters = (newFilters: Partial<FilterState>) => {
		setFilters((prev) => ({ ...prev, ...newFilters }))
		setCurrentPage(1)
	}

	// Helper function để format price
	const formatPrice = (price: number): string => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND'
		}).format(price)
	}

	// Helper function để normalize tên tỉnh/thành phố và quận/huyện để so sánh
	const normalizeLocationName = (name: string): string => {
		if (!name) return ''
		return name
			.toLowerCase()
			.trim()
			// Loại bỏ các ký tự đặc biệt và khoảng trắng thừa
			.replace(/[.,\-_]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()
			// Chuẩn hóa một số tên phổ biến
			.replace(/thành phố\s*/gi, '')
			.replace(/tp\s*/gi, '')
			.replace(/tỉnh\s*/gi, '')
			.replace(/hồ chí minh/gi, 'ho chi minh')
			.replace(/hà nội/gi, 'ha noi')
			.replace(/đà nẵng/gi, 'da nang')
	}

	// Helper function để kiểm tra xem hai tên location có match không
	const isLocationMatch = (name1: string, name2: string): boolean => {
		if (!name1 || !name2) return false
		const normalized1 = normalizeLocationName(name1)
		const normalized2 = normalizeLocationName(name2)
		
		// So sánh chính xác sau khi normalize
		if (normalized1 === normalized2) return true
		
		// So sánh một trong hai chứa cái kia
		if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return true
		
		return false
	}

	const filteredData = useMemo(() => {
		// Map dữ liệu từ API sang Model hiển thị, giữ thông tin location gốc để lọc
		const mappedProducts = products.map((p: any) => {
			const locationData = typeof p.location === 'object' ? p.location : null
			const locationString = typeof p.location === 'string' ? p.location : (p.location?.city || '')
			
			return {
				product: {
					id: p.id,
					title: p.title,
					price: p.price,
					priceText: p.priceText || formatPrice(p.price),
					imageUrl: p.imageUrl || (p.images && p.images[0]) || 'https://placehold.co/400x300',
					condition: p.condition || 'Tốt',
					conditionColor: p.conditionColor || 'blue',
					sellerName: p.sellerName || 'Unknown',
					sellerAvatarUrl: p.sellerAvatarUrl,
					location: locationString,
					categoryId: p.categoryId || '',
					timeAgo: p.timeAgo || '',
					photosCount: p.images?.length || 0,
					isLiked: p.isLiked || false
				} as ProductModel,
				locationData, // Giữ thông tin location đầy đủ để lọc chính xác
				locationString
			}
		})

		// Lọc theo categoryIds trước
		let filteredByCategory = mappedProducts
		if (filters.categoryIds.length > 0) {
			filteredByCategory = mappedProducts.filter((item) => 
				filters.categoryIds.includes(item.product.categoryId)
			)
		}

		// Cải thiện lọc khu vực: kiểm tra cả city và district với normalize
		let filteredByLocation = filteredByCategory
		if (filters.locations.length > 0 || filters.selectedCity) {
			filteredByLocation = filteredByCategory.filter((item) => {
				const { locationData, locationString } = item
				
				// Nếu có selectedCity và selectedDistrict
				if (filters.selectedCity && filters.selectedDistrict) {
					const cityMatch = locationData
						? isLocationMatch(locationData.city || '', filters.selectedCity)
						: isLocationMatch(locationString || '', filters.selectedCity)
					
					const districtMatch = locationData
						? isLocationMatch(locationData.district || '', filters.selectedDistrict)
						: isLocationMatch(locationString || '', filters.selectedDistrict)
					
					return cityMatch && districtMatch
				}
				
				// Nếu chỉ có selectedCity
				if (filters.selectedCity) {
					const cityMatch = locationData
						? isLocationMatch(locationData.city || '', filters.selectedCity)
						: isLocationMatch(locationString || '', filters.selectedCity)
					return cityMatch
				}
				
				// Lọc theo locations array (backward compatibility)
				if (filters.locations.length > 0) {
					return filters.locations.some(loc => {
						if (locationData) {
							return isLocationMatch(locationData.city || '', loc) ||
								   isLocationMatch(locationData.district || '', loc) ||
								   isLocationMatch(locationString || '', loc)
						}
						return isLocationMatch(locationString || '', loc)
					})
				}
				
				return true
			})
		}

		let res = filteredByLocation.map(item => item.product)

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
				) : isError ? (
					<div className="text-center py-20 bg-white rounded-xl border border-dashed">
						<p className="text-red-500 mb-2">Đã xảy ra lỗi khi tải sản phẩm.</p>
						<button
							onClick={() => window.location.reload()}
							className="text-blue-600 font-bold mt-2"
						>
							Thử lại
						</button>
					</div>
				) : (
					<div className="flex flex-col lg:flex-row gap-8">
						{/* SIDEBAR */}
						<FiltersSidebar
							filters={filters}
							categories={categories}
							onFilterChange={updateFilters}
							onClearFilters={clearFilters}
							isLoadingCategories={isLoadingCategories}
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
