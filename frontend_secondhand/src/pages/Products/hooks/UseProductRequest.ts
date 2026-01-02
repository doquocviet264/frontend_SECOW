import { useQuery } from '@tanstack/react-query'

import { getProductRequest } from '../api/ProducstRequest'

export const useProductRequest = () =>
	useQuery({
		queryKey: ['getProductRequest'],
		queryFn: getProductRequest
	})
