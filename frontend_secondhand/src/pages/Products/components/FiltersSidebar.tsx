import React, { useState, useEffect, useRef } from 'react'
import type { CategoryModel, FilterState } from '../type'
import { addressService, type Province, type District } from '@/services/addressService'

interface FiltersSidebarProps {
	filters: FilterState
	categories: CategoryModel[] // Truyền danh mục cha con vào đây
	onFilterChange: (newFilters: Partial<FilterState>) => void
	onClearFilters: () => void
	isLoadingCategories?: boolean // Trạng thái loading danh mục
}

export default function FiltersSidebar({
	filters,
	categories,
	onFilterChange,
	onClearFilters,
	isLoadingCategories = false
}: FiltersSidebarProps) {
	// --- LOGIC SLIDER KÉO THẢ ---
	const minLimit = 0
	const maxLimit = 50000000
	const [tempPrice, setTempPrice] = useState(filters.priceRange)

	// --- LOGIC TỈNH/THÀNH PHỐ VÀ QUẬN/HUYỆN ---
	const [provinces, setProvinces] = useState<Province[]>([])
	const [districts, setDistricts] = useState<District[]>([])
	const [loadingProvinces, setLoadingProvinces] = useState(false)
	const [loadingDistricts, setLoadingDistricts] = useState(false)

	// Fetch provinces khi component mount
	useEffect(() => {
		const loadProvinces = async () => {
			try {
				setLoadingProvinces(true)
				const data = await addressService.getProvinces()
				setProvinces(data)
			} catch (error) {
				console.error('Error loading provinces:', error)
				setProvinces([])
			} finally {
				setLoadingProvinces(false)
			}
		}
		loadProvinces()
	}, [])

	// Fetch districts khi chọn province
	useEffect(() => {
		if (!filters.selectedCity) {
			setDistricts([])
			return
		}

		const loadDistricts = async () => {
			try {
				setLoadingDistricts(true)
				// Tìm province code từ tên
				const provinceCode = await addressService.findProvinceCodeByName(filters.selectedCity || '')
				if (provinceCode) {
					const data = await addressService.getDistrictsByProvince(provinceCode)
					setDistricts(data)
				} else {
					setDistricts([])
				}
			} catch (error) {
				console.error('Error loading districts:', error)
				setDistricts([])
			} finally {
				setLoadingDistricts(false)
			}
		}

		loadDistricts()
	}, [filters.selectedCity])

	// Cập nhật local state khi props thay đổi (ví dụ khi ấn nút Clear)
	useEffect(() => {
		setTempPrice(filters.priceRange)
	}, [filters.priceRange])

	const handleSliderChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		type: 'min' | 'max'
	) => {
		const val = parseInt(e.target.value)
		if (type === 'min') {
			const newMin = Math.min(val, tempPrice.max - 1000000) // Không cho min vượt quá max
			setTempPrice({ ...tempPrice, min: newMin })
		} else {
			const newMax = Math.max(val, tempPrice.min + 1000000) // Không cho max thấp hơn min
			setTempPrice({ ...tempPrice, max: newMax })
		}
	}

	const applyPrice = () => {
		onFilterChange({ priceRange: tempPrice })
	}

	// --- LOGIC DANH MỤC ĐA CẤP ---
	const toggleCategory = (catId: string) => {
		const current = filters.categoryIds
		const isSelected = current.includes(catId)
		let newIds = []
		if (isSelected) {
			newIds = current.filter((id) => id !== catId)
		} else {
			newIds = [...current, catId]
		}
		onFilterChange({ categoryIds: newIds })
	}

	// Render đệ quy danh mục
	const renderCategory = (cat: CategoryModel, level = 0) => {
		return (
			<div key={cat.id} className="w-full">
				<label
					className={`flex items-center gap-2 cursor-pointer py-1.5 hover:text-blue-600 transition-colors ${
						level > 0 ? 'pl-6' : ''
					}`}
				>
					<input
						type="checkbox"
						className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						checked={filters.categoryIds.includes(cat.id)}
						onChange={() => toggleCategory(cat.id)}
					/>
					<span
						className={`text-sm ${
							level === 0 ? 'font-medium' : 'text-gray-600'
						}`}
					>
						{cat.name}
					</span>
					{cat.count && (
						<span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full ml-auto">
							{cat.count}
						</span>
					)}
				</label>
				{/* Đệ quy render con */}
				{cat.children &&
					cat.children.map((child) => renderCategory(child, level + 1))}
			</div>
		)
	}

	return (
		<aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
			{/* NÚT XÓA LỌC */}
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-lg text-gray-900 dark:text-white">
					Bộ lọc
				</h3>

				<button
					onClick={onClearFilters}
					className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 
                    px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10
                    transition"
				>
					<span className="material-symbols-outlined text-[18px]">
						restart_alt
					</span>
					Xóa lọc
				</button>
			</div>

			{/* DANH MỤC ĐA CẤP */}
			<div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
				<h4 className="font-bold text-gray-900 dark:text-white mb-3">
					Danh mục
				</h4>
				{isLoadingCategories ? (
					<div className="flex items-center justify-center py-4">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
					</div>
				) : categories.length === 0 ? (
					<p className="text-sm text-gray-500 py-2">Chưa có danh mục nào</p>
				) : (
					<div className="space-y-1">
						{categories.map((cat) => renderCategory(cat))}
					</div>
				)}
			</div>

			{/* KHOẢNG GIÁ (Range Slider + Input) */}
			<div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
				<h4 className="font-bold text-gray-900 dark:text-white mb-4">
					Khoảng giá
				</h4>

				{/* Input fields để nhập giá */}
				<div className="grid grid-cols-2 gap-3 mb-4">
					<div>
						<label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
							Giá tối thiểu (VNĐ)
						</label>
						<input
							type="number"
							min={0}
							max={maxLimit}
							step={10000}
							value={tempPrice.min}
							onChange={(e) => {
								const val = Math.max(0, Math.min(parseInt(e.target.value) || 0, tempPrice.max - 10000))
								setTempPrice({ ...tempPrice, min: val })
							}}
							className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="0"
						/>
					</div>
					<div>
						<label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
							Giá tối đa (VNĐ)
						</label>
						<input
							type="number"
							min={tempPrice.min + 10000}
							max={maxLimit}
							step={10000}
							value={tempPrice.max}
							onChange={(e) => {
								const val = Math.max(tempPrice.min + 10000, Math.min(parseInt(e.target.value) || maxLimit, maxLimit))
								setTempPrice({ ...tempPrice, max: val })
							}}
							className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="50000000"
						/>
					</div>
				</div>

				{/* Slider Visual */}
				<div className="relative h-12 mb-2">
					{/* Track nền */}
					<div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full -translate-y-1/2"></div>
					{/* Track màu (Khoảng giữa min và max) */}
					<div
						className="absolute top-1/2 h-1 bg-blue-600 rounded-full -translate-y-1/2"
						style={{
							left: `${(tempPrice.min / maxLimit) * 100}%`,
							right: `${100 - (tempPrice.max / maxLimit) * 100}%`
						}}
					></div>

					{/* Input Min (Vô hình nhưng kéo được) */}
					<input
						type="range"
						min={minLimit}
						max={maxLimit}
						step={500000}
						value={tempPrice.min}
						onChange={(e) => handleSliderChange(e, 'min')}
						className="absolute pointer-events-none appearance-none bg-transparent w-full h-full top-0 left-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer z-10"
					/>
					{/* Input Max */}
					<input
						type="range"
						min={minLimit}
						max={maxLimit}
						step={500000}
						value={tempPrice.max}
						onChange={(e) => handleSliderChange(e, 'max')}
						className="absolute pointer-events-none appearance-none bg-transparent w-full h-full top-0 left-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer z-20"
					/>
				</div>

				{/* Hiển thị số tiền */}
				<div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
					<span>{new Intl.NumberFormat('vi-VN').format(tempPrice.min)} VNĐ</span>
					<span>{new Intl.NumberFormat('vi-VN').format(tempPrice.max)} VNĐ</span>
				</div>

				<button
					onClick={applyPrice}
					className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm text-sm"
				>
					Áp dụng
				</button>
			</div>

			{/* KHU VỰC */}
			<div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
				<h4 className="font-bold text-gray-900 dark:text-white mb-3">
					Khu vực
				</h4>
				
				{/* Dropdown chọn thành phố */}
				<div className="mb-3">
					<label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
						Thành phố
					</label>
					{loadingProvinces ? (
						<div className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-center">
							<span className="text-gray-500">Đang tải...</span>
						</div>
					) : (
						<select
							className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							value={filters.selectedCity || ''}
							onChange={(e) => {
								const city = e.target.value
								onFilterChange({ 
									selectedCity: city,
									selectedDistrict: '', // Reset district khi đổi city
									locations: city ? [city] : []
								})
							}}
						>
							<option value="">Tất cả thành phố</option>
							{provinces.map((province) => (
								<option key={province.code} value={province.name}>
									{province.name}
								</option>
							))}
						</select>
					)}
				</div>

				{/* Dropdown chọn quận/huyện (chỉ hiện khi đã chọn thành phố) */}
				{filters.selectedCity && (
					<div className="mb-3">
						<label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
							Quận/Huyện
						</label>
						{loadingDistricts ? (
							<div className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-center">
								<span className="text-gray-500">Đang tải...</span>
							</div>
						) : (
							<select
								className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								value={filters.selectedDistrict || ''}
								onChange={(e) => {
									const district = e.target.value
									onFilterChange({ 
										selectedDistrict: district,
										locations: district ? [`${filters.selectedCity} - ${district}`] : [filters.selectedCity || '']
									})
								}}
							>
								<option value="">Tất cả quận/huyện</option>
								{districts.map((district) => (
									<option key={district.code} value={district.name}>
										{district.name}
									</option>
								))}
							</select>
						)}
					</div>
				)}
			</div>
		</aside>
	)
}
