import { useQuery } from '@tanstack/react-query'
import { categoryService } from '@/services/categoryService'

export const useCategoryName = (categoryId: string | undefined) => {
	return useQuery({
		queryKey: ['categoryName', categoryId],
		queryFn: async () => {
			if (!categoryId) return null
			try {
				const response = await categoryService.getCategoryById(categoryId)
				return response.data?.category?.name || null
			} catch (error) {
				// Fallback: try to find in all categories if direct fetch fails
				const response = await categoryService.getCategories()
				const category = response.data?.find((cat) => cat._id === categoryId)
				return category?.name || null
			}
		},
		enabled: !!categoryId,
		staleTime: 1000 * 60 * 5 // Cache for 5 minutes
	})
}

