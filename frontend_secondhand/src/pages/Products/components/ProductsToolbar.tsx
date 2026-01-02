import React from 'react'
import type { ViewMode } from '../type'

interface ProductsToolbarProps {
	totalCount: number
	viewMode: ViewMode
	onViewModeChange: (mode: ViewMode) => void
	sortOption: string
	onSortChange: (value: string) => void
}

export default function ProductsToolbar({
	totalCount,
	viewMode,
	onViewModeChange,
	sortOption,
	onSortChange
}: ProductsToolbarProps) {
	return (
		<div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
			<div className="flex flex-col sm:flex-row sm:items-center gap-2">
				<h2 className="text-lg font-bold text-gray-900 dark:text-white">
					Kết quả tìm kiếm
				</h2>
				<span className="text-sm text-gray-500">({totalCount} sản phẩm)</span>
			</div>

			<div className="flex items-center gap-3 w-full sm:w-auto justify-end">
				{/* Dropdown Sắp xếp */}
				<div className="relative">
					<select
						className="appearance-none bg-gray-50 dark:bg-gray-900 border-none text-gray-900 dark:text-white py-2 pl-3 pr-8 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 cursor-pointer"
						value={sortOption}
						onChange={(e) => onSortChange(e.target.value)}
					>
						<option value="newest">Mới nhất</option>
						<option value="price_asc">Giá tăng dần</option>
						<option value="price_desc">Giá giảm dần</option>
					</select>
					<span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-lg text-gray-500 pointer-events-none">
						expand_more
					</span>
				</div>

				{/* Nút chuyển đổi View Mode */}
				<div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
					<button
						onClick={() => onViewModeChange('grid')}
						className={`p-1.5 rounded-md transition-all ${
							viewMode === 'grid'
								? 'bg-white shadow-sm text-blue-600'
								: 'text-gray-500 hover:text-gray-900'
						}`}
					>
						<span className="material-symbols-outlined text-xl">grid_view</span>
					</button>
					<button
						onClick={() => onViewModeChange('list')}
						className={`p-1.5 rounded-md transition-all ${
							viewMode === 'list'
								? 'bg-white shadow-sm text-blue-600'
								: 'text-gray-500 hover:text-gray-900'
						}`}
					>
						<span className="material-symbols-outlined text-xl">view_list</span>
					</button>
				</div>
			</div>
		</div>
	)
}
