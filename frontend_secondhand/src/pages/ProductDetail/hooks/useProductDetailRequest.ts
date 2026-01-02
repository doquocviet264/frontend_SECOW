import { getProductDetail } from '../api/ProductDetailRequest'
import type { IProductDetailParams } from '../type'
import { useQuery } from '@tanstack/react-query'

export const useProductDetail = (params: IProductDetailParams) =>
	useQuery({
		queryKey: ['ProductDetail', params.id],
		queryFn: () => getProductDetail(params)
	})

