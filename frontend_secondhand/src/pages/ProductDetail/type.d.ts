export interface IProductDetail {
	id: string
	title: string
	description: string
	priceText: string
	price: number
	images: string[]
	condition: string
	conditionColor: string
	sellerName: string
	sellerId: string
	sellerAvatarUrl: string
	sellerEmail?: string
	sellerPhone?: string
	storeId?: string | null
	sellerInfo?: {
		storeName: string
		rating: number
		totalReviews: number
		totalSales: number
		productCount: number
		joinedYears: number
	} | null
	location: string
	categoryId: string
	timeAgo: string
	stock: string
	status: string
	views: number
	sku: string
	createdAt: string
	updatedAt: string
}

export interface IProductDetailParams {
	id: string
}
