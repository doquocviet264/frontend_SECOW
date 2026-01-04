import { useQuery } from '@tanstack/react-query'
import { categoryService } from '@/services/categoryService'
import type { CategoryModel } from '../type'
import type { Category } from '@/types/product'

// Hàm transform category từ API sang CategoryModel
const transformCategory = (cat: Category): CategoryModel => {
	return {
		id: cat._id,
		name: cat.name,
		count: cat.productCount,
		children: cat.children?.map(transformCategory)
	}
}

// Hàm xây dựng cây danh mục từ danh sách phẳng
const buildCategoryTree = (categories: Category[]): CategoryModel[] => {
	// Tạo map để tra cứu nhanh
	const categoryMap = new Map<string, CategoryModel>()
	const rootCategories: CategoryModel[] = []

	// Bước 1: Transform tất cả categories và lưu vào map
	categories.forEach((cat) => {
		const categoryModel: CategoryModel = {
			id: cat._id,
			name: cat.name,
			count: cat.productCount,
			children: []
		}
		categoryMap.set(cat._id, categoryModel)
	})

	// Bước 2: Xây dựng cây
	categories.forEach((cat) => {
		const categoryModel = categoryMap.get(cat._id)!
		
		// Xử lý parentId: có thể là string, ObjectId object, hoặc null/undefined
		const parentIdStr = cat.parentId 
			? (typeof cat.parentId === 'string' ? cat.parentId : String(cat.parentId))
			: null
		
		if (!parentIdStr) {
			// Danh mục gốc
			rootCategories.push(categoryModel)
		} else {
			// Danh mục con - thêm vào children của parent
			const parent = categoryMap.get(parentIdStr)
			if (parent) {
				if (!parent.children) {
					parent.children = []
				}
				parent.children.push(categoryModel)
			} else {
				// Nếu không tìm thấy parent, coi như danh mục gốc (tránh lỗi)
				rootCategories.push(categoryModel)
			}
		}
	})

	return rootCategories.sort((a, b) => a.name.localeCompare(b.name))
}

export const useCategories = () => {
	return useQuery({
		queryKey: ['categories', 'tree'],
		queryFn: async () => {
			try {
				const response = await categoryService.getCategories()
				// Backend trả về: { success: true, data: { categories: [...] } }
				let categories: Category[] = []
				
				if (response && response.data) {
					if (response.data.categories && Array.isArray(response.data.categories)) {
						categories = response.data.categories
					} else if (Array.isArray(response.data)) {
						categories = response.data
					}
				}

				// Transform và xây dựng cây
				return buildCategoryTree(categories)
			} catch (error) {
				console.error('Error fetching categories:', error)
				return []
			}
		},
		retry: 1,
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000, // Cache 5 phút
	})
}

