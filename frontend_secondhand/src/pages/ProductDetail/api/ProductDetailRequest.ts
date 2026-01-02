import axios from '@/config/axios'
import type { IProductDetail, IProductDetailParams } from '../type'

export const getProductDetail = async (
	params: IProductDetailParams
): Promise<IProductDetail> => {
	const res = await axios.get(`/v1/products/${params.id}`)
	return res.data?.data?.product || res.data
}

