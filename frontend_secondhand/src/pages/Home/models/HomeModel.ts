/**
 * Home Model - Data structures only
 * Mapping từ API response sang domain model
 */

export type Category = {
  name: string;
  imageUrl: string;
};

export type Product = {
  id: string;
  title: string;
  imageUrl: string;
  price: string;
  location: string;
  timeAgo: string;
  badge?: string;
};

/**
 * Format location helper
 */
export function formatLocation(location: any): string {
  if (!location) return 'Chưa cập nhật';
  
  if (typeof location === 'string') {
    return location;
  }
  
  if (location && typeof location === 'object') {
    const parts = [
      location.city,
      location.district,
      location.detail
    ].filter(Boolean);
    
    if (parts.length > 0) {
      return parts.join(', ');
    }
  }
  
  return 'Chưa cập nhật';
}

/**
 * Format price helper
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

/**
 * Map API product to Home Product model
 */
export function mapApiProductToHomeProduct(apiProduct: any): Product {
  const conditionMap: Record<string, string> = {
    'Like New': 'Like New',
    'Good': 'Tốt',
    'Fair': 'Khá',
    'Old': 'Cũ',
  };

  return {
    id: apiProduct.id || apiProduct._id,
    title: apiProduct.title || '',
    imageUrl: apiProduct.imageUrl || (apiProduct.images && apiProduct.images[0]) || 'https://placehold.co/400x300',
    price: apiProduct.priceText || formatPrice(apiProduct.price),
    location: formatLocation(apiProduct.location),
    timeAgo: apiProduct.timeAgo || 'Chưa xác định',
    badge: conditionMap[apiProduct.condition] || undefined,
  };
}

/**
 * Map API categories to Home Category model
 */
export function mapApiCategoriesToHomeCategories(apiCategories: any[]): Category[] {
  if (!Array.isArray(apiCategories)) return [];
  return apiCategories
    .filter((cat: any) => cat && (cat.isActive !== false))
    .slice(0, 6) // Limit to 6 categories
    .map((cat: any) => ({
      name: cat.name || '',
      imageUrl: cat.image || 'https://placehold.co/200x200',
    }));
}



