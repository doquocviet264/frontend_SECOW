export type ViewMode = "grid" | "list";

export interface ProductModel {
  id: string;
  title: string;
  priceText: string;
  price: number; // Thêm trường số để lọc cho dễ
  imageUrl: string;
  condition: string;
  conditionColor: string;
  sellerName: string;
  sellerAvatarUrl?: string;
  location: string;
  categoryId: string; // ID danh mục để lọc
  timeAgo: string;
  photosCount?: number;
  isLiked?: boolean;
}

export interface CategoryModel {
  id: string;
  name: string;
  count?: number;
  children?: CategoryModel[];
}

export interface FilterState {
  categoryIds: string[];
  locations: string[];
  conditions: string[];
  priceRange: { min: number; max: number };
  selectedCity?: string;
  selectedDistrict?: string;
}