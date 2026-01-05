/**
 * Product Model - Data structures only
 * Mapping từ API response sang domain model
 */

export type ViewMode = "grid" | "list";

export interface ProductModel {
  id: string;
  title: string;
  priceText: string;
  price: number;
  imageUrl: string;
  condition: string;
  conditionColor: string;
  sellerName: string;
  sellerAvatarUrl?: string;
  location: string;
  categoryId: string;
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

export interface LocationData {
  city?: string;
  district?: string;
  detail?: string;
}

/**
 * Map API product to ProductModel
 */
export function mapApiProductToModel(apiProduct: any, formatPrice: (price: number) => string): ProductModel {
  const locationData = typeof apiProduct.location === 'object' ? apiProduct.location : null;
  const locationString = typeof apiProduct.location === 'string' 
    ? apiProduct.location 
    : (apiProduct.location?.city || '');

  return {
    id: apiProduct.id,
    title: apiProduct.title,
    price: apiProduct.price,
    priceText: apiProduct.priceText || formatPrice(apiProduct.price),
    imageUrl: apiProduct.imageUrl || (apiProduct.images && apiProduct.images[0]) || 'https://placehold.co/400x300',
    condition: apiProduct.condition || 'Tốt',
    conditionColor: apiProduct.conditionColor || 'blue',
    sellerName: apiProduct.sellerName || 'Unknown',
    sellerAvatarUrl: apiProduct.sellerAvatarUrl,
    location: locationString,
    categoryId: apiProduct.categoryId || '',
    timeAgo: apiProduct.timeAgo || '',
    photosCount: apiProduct.images?.length || 0,
    isLiked: apiProduct.isLiked || false,
  };
}

/**
 * Format price helper
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}



