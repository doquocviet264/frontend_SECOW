import { useQuery } from '@tanstack/react-query'

import { getProductRequest, type GetProductsParams } from '../api/ProducstRequest'

export const useProductRequest = (params?: GetProductsParams) =>
	useQuery({
		queryKey: ['getProductRequest', params],
		queryFn: () => getProductRequest(params)
	})
