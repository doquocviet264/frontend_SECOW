import { useMemo } from 'react'
import { useParams } from 'react-router-dom' // 1. Import để lấy ID từ URL

import ProductGallery from './components/ProductGallery'
import ProductInfoCard from './components/ProductInfoCard'
import SellerCard from './components/SellerCard'
import ProductTabs from './components/ProductTabs'
import ReviewsSection from './components/ReviewsSection'

// Import Type UI và Type API
import type { ProductDetail, Review, ProductConditionLabel } from './types' // Type cho UI
import { useProductDetail } from './hooks/useProductDetailRequest' // 2. Import Hook

import PageLayout from '@/components/layout/PageLayout'

// Helper function to map API condition to UI conditionLabel
const mapConditionToLabel = (condition: string): ProductConditionLabel => {
	const conditionMap: Record<string, ProductConditionLabel> = {
		'Like New': 'Như mới',
		Tốt: 'Tốt',
		Khá: 'Khá',
		Cũ: 'Cũ'
	}
	return conditionMap[condition] || 'Tốt' // Default fallback
}

// --- MOCK DATA CHO PHẦN CHƯA CÓ API ---
const MOCK_REVIEWS: Review[] = [
	{
		id: 'r1',
		name: 'Trần Văn B',
		timeAgo: '1 tuần trước',
		rating: 5,
		content:
			'Người bán nhiệt tình, đóng gói rất kỹ. Máy đẹp như mô tả, chụp nét căng.',
		images: ['https://placehold.co/100x100']
	},
	{
		id: 'r2',
		name: 'Lê Thị C',
		timeAgo: '1 tháng trước',
		rating: 4,
		content: 'Sản phẩm ổn, giao hàng hơi chậm một chút nhưng shop hỗ trợ tốt.'
	}
]

const DEFAULT_RETURN_POLICY = [
	'Hoàn tiền trong 3 ngày nếu sản phẩm sai mô tả.',
	'Không hỗ trợ đổi trả nếu người mua tự làm hư.',
	'Ưu tiên giao dịch tại nhà để kiểm tra.'
]
// ---------------------------------------

export default function ProductDetailPage() {
	// 1. Lấy ID từ URL
	const { id } = useParams<{ id: string }>()

	// 2. Gọi Hook React Query
  // Lưu ý: params.id cần string, nếu id undefined thì truyền chuỗi rỗng để tránh lỗi query

	const {
		data: apiData,
		isLoading,
		isError
	} = useProductDetail({ id: id || '' })

	// 3. Mapping Data (Chuyển đổi từ API format sang UI format)
	const product = useMemo((): ProductDetail | null => {
		if (!apiData) return null

		// Parse location nếu là object
		let locationString = ''
		if (typeof apiData.location === 'string') {
			locationString = apiData.location
		} else if (apiData.location && typeof apiData.location === 'object') {
			const loc = apiData.location as any
			locationString = [loc.city, loc.district, loc.detail]
				.filter(Boolean)
				.join(', ')
		}

		return {
			id: apiData.id,
			title: apiData.title,
			price: apiData.price,
			oldPrice: apiData.originalPrice || undefined,
			conditionLabel: mapConditionToLabel(apiData.condition),
			isApproved: apiData.status === 'active',
			location: locationString || 'Chưa cập nhật',
			postedAgo: apiData.timeAgo || 'Chưa xác định',
			images:
				apiData.images && apiData.images.length > 0
					? apiData.images
					: ['https://placehold.co/600x400'], // Fallback image

			// UI cần mảng string, API trả 1 string -> Split hoặc bọc vào mảng
			description: apiData.description
				? apiData.description.split('\n').filter((line) => line.trim() !== '')
				: ['Không có mô tả chi tiết.'],

			defects: [], // API chưa có -> Để rỗng hoặc hardcode nếu muốn

			// Tạo thông số kỹ thuật từ các field có sẵn
			specs: [
				{ label: 'Mã SKU', value: apiData.sku || 'N/A' },
				{ label: 'Danh mục', value: apiData.categoryId || 'N/A' },
				{ label: 'Tình trạng', value: apiData.condition || 'N/A' },
				{ label: 'Thương hiệu', value: apiData.brand || 'N/A' },
				{ label: 'Số lượng', value: String(apiData.stock || 1) },
				{
					label: 'Ngày đăng',
					value: apiData.createdAt
						? new Date(apiData.createdAt).toLocaleDateString('vi-VN')
						: 'N/A'
				}
			],

			returnPolicy: DEFAULT_RETURN_POLICY,

			// Gom nhóm thông tin người bán
			seller: {
				id: apiData.sellerId || 'unknown',
				name: apiData.sellerName || 'Người bán ẩn danh',
				avatarUrl: apiData.sellerAvatarUrl || '',
				// Các trường dưới API chưa có, set mặc định để không lỗi UI
				rating: 5.0,
				totalReviews: 0,
				responseRate: 100,
				joinedYears: 1,
				isOnline: false
			}
		}
	}, [apiData])

	// --- XỬ LÝ LOADING / ERROR ---
	if (isLoading) {
		return (
			<PageLayout>
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
				</div>
			</PageLayout>
		)
	}

	if (isError || !product) {
		return (
			<PageLayout>
				<div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
					<h2 className="text-2xl font-bold text-gray-700 mb-2">
						Không tìm thấy sản phẩm
					</h2>
					<p className="text-gray-500">
						Sản phẩm có thể đã bị xóa hoặc đường dẫn không đúng.
					</p>
				</div>
			</PageLayout>
		)
	}

	// --- RENDER UI CHÍNH (Giữ nguyên cấu trúc cũ) ---
	return (
		<PageLayout>
			<main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
					{/* CỘT TRÁI: ẢNH & THÔNG TIN CHI TIẾT */}
					<div className="lg:col-span-7">
						<ProductGallery images={product.images} />

						{/* Chỉ hiện cảnh báo nếu có defect (hiện tại đang để rỗng do API thiếu) */}
						{product.defects.length > 0 && (
							<div className="mt-4 p-5 rounded-xl border border-amber-200/60 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-700/30">
								<div className="flex items-start gap-3">
									<span className="material-symbols-outlined text-amber-600 dark:text-amber-500 mt-0.5">
										warning
									</span>
									<div>
										<h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-1 uppercase tracking-wider">
											Tình trạng thực tế (Lưu ý)
										</h3>
										<ul className="list-disc list-inside text-sm text-amber-900/80 dark:text-amber-200/80 space-y-1">
											{product.defects.map((d, i) => (
												<li key={i}>{d}</li>
											))}
										</ul>
									</div>
								</div>
							</div>
						)}

						<ProductTabs
							description={product.description}
							specs={product.specs}
							returnPolicy={product.returnPolicy}
						/>
					</div>

					{/* CỘT PHẢI: GIÁ & NGƯỜI BÁN */}
					<div className="lg:col-span-5">
						<div className="lg:sticky lg:top-24 flex flex-col gap-6">
							<ProductInfoCard
								isApproved={product.isApproved}
								conditionLabel={product.conditionLabel}
								title={product.title}
								postedAgo={product.postedAgo}
								location={product.location}
								price={product.price}
								oldPrice={product.oldPrice}
								stock={Number(apiData?.stock) || 1} // Ép kiểu lại cho chắc chắn
							/>
							<SellerCard seller={product.seller} />
						</div>
					</div>
				</div>

				{/* PHẦN REVIEW (Hiện tại vẫn Mock) */}
				<ReviewsSection reviews={MOCK_REVIEWS} />
			</main>
		</PageLayout>
	)
}
