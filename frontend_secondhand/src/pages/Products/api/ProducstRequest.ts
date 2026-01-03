import axios from '@/config/axios'
import type { IProductList } from '../types'

export interface GetProductsParams {
	page?: number
	limit?: number
	categoryId?: string
	location?: string
	condition?: string
	minPrice?: number
	maxPrice?: number
	sortBy?: string
	search?: string
}

export const getProductRequest = async (
	params?: GetProductsParams
): Promise<IProductList[]> => {
	const res = await axios.get(`/v1/products/`, { params })
	return res.data?.data?.products || []
}
