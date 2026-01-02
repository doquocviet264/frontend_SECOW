import React from 'react'
import ProductCard from './ProductCard'
import type { ProductModel, ViewMode } from '../type'

interface ProductsGridProps {
	items: ProductModel[]
	viewMode: ViewMode
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

export default function ProductsGrid({
	items,
	viewMode,
	currentPage,
	totalPages,
	onPageChange
}: ProductsGridProps) {
	return (
		<div>
			{/* Nếu viewMode là list thì dùng 1 cột, grid thì dùng responsive cột */}
			<div
				className={`grid gap-4 ${
					viewMode === 'list'
						? 'grid-cols-1'
						: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
				}`}
			>
				{items.map((item) => (
					<ProductCard key={item.id} item={item} viewMode={viewMode} />
				))}
			</div>

			{totalPages > 0 && (
				<div className="mt-8 flex items-center justify-center gap-2">
					<button
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
					>
						Trước
					</button>
					<span className="text-sm font-medium text-gray-600 px-2">
						Trang {currentPage} / {totalPages}
					</span>
					<button
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
					>
						Sau
					</button>
				</div>
			)}
		</div>
	)
}
