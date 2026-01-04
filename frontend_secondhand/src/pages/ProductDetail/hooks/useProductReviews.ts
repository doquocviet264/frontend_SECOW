import { useQuery } from '@tanstack/react-query'
import { reviewService } from '@/services/reviewService'
import type { Review } from '../types'

// Helper function to format time ago
const getTimeAgo = (date: string): string => {
	const now = new Date()
	const reviewDate = new Date(date)
	const diffInSeconds = Math.floor((now.getTime() - reviewDate.getTime()) / 1000)

	if (diffInSeconds < 60) return 'Vừa xong'
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
	if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`
	if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} tuần trước`
	if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`
	return `${Math.floor(diffInSeconds / 31536000)} năm trước`
}

// Transform API review to UI review format
const transformReview = (apiReview: any): Review => {
	return {
		id: apiReview._id,
		name: apiReview.customer?.name || 'Người dùng ẩn danh',
		timeAgo: getTimeAgo(apiReview.createdAt),
		rating: apiReview.rating || 5,
		content: apiReview.comment || 'Không có nhận xét',
		images: apiReview.images || []
	}
}

export const useProductReviews = (productId: string | undefined) => {
	return useQuery({
		queryKey: ['productReviews', productId],
		queryFn: async () => {
			if (!productId) return []
			const response = await reviewService.getProductReviews(productId, { page: 1, limit: 10 })
			return (response.data?.reviews || []).map(transformReview)
		},
		enabled: !!productId
	})
}

