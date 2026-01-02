import axios from '@/config/axios'
import type { IProductList } from '../types'

export const getProductRequest = async (): Promise<IProductList[]> => {
	const res = await axios.get(`/v1/products/`)
	return res.data?.data?.products || []
}
