import { useMemo } from "react";
import HeroSection from "./components/HeroSection";
import TrustIndicators from "./components/TrustIndicators";
import CategoryGrid from "./components/CategoryGrid";
import ProductSection from "./components/ProductSection";
import PromoBanners from "./components/PromoBanners";
import PageLayout from "@/components/layout/PageLayout";
import type { Category, Product } from "@/pages/Home/types";
import { useNewestProducts, useRecommendedProducts } from "./hooks/useHomeProducts";
import { useHomeCategories } from "./hooks/useCategories";

const HERO_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC1jeNG2o6ecxLa6uNq7NQ_Ey2nz51U8DPTERs1fAx4406S26ekSGKyaCnm422axLpVII78BT8_bHFKCVuC3tG1OOPwWHBUldtCWYuqD5AQHbKasXZs1gRjaSxt4dTSedFsVeq-xGkwhXbo9RCEfx5O7te5hi9A0yUI5EK5vsHZr280xA0x1I5UCYOLhQ8j-nPO-71mHT57djKkECSbKvX7kcxTcu5pncwSEFaegQwvVKpiJmr8fQT6c9I9pjMdUur4Rb-40iIuf3i5';

const BANNERS = [
  {
    title: "Thời trang 2hand",
    desc: "Săn hàng hiệu giá rẻ, phong cách vintage độc đáo.",
    cta: "Khám phá ngay",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDes2gyIE3OsEtt5XoSECALYdVvnuYMAJUqOAzkDxyqekTRhYbvLaDYU0jENshCog3Dqyis7ChT6Q1kWmHi89THgYVJZ-9M_9IaYyQy7i1CpevxbNpdm-gQObXPczEfP7aVKahFMDelgZx5IXIfq9-Xzb5Y4-smGj2kVihDxtQsjNQKkFhQbtZ1KmKt7zSGal1ZRv1MIREWv35FmlNJ-FZYhD0nwIFKmRCd0-ZdWgdYE5J5NmGfuQfXeraweSTz1TnhjD6_mNLod3yy",
  },
  {
    title: "Thanh lý Đồ công nghệ",
    desc: "Điện thoại, Laptop, Phụ kiện giá tốt mỗi ngày.",
    cta: "Xem ngay",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnPzpFzJg3HQwcJ_a6BWi4LOO-M-YNGZVW6Shwa4Van8vcVB1ipTrmUMacNFj4D8Lk7BLJiVnsFmzuTnBtkO7xErADDj7fLoRvU8GE3Q4m6v_6xs5BAGHL1iposoVPtrfZtAML78qoJi2Lpd_vCUyQvticSQcSuTkwRx3vrEQtsDhNLjPYslxz8tMv3Sp4ocJ9Fe8fTE71jYL_ulAXRAT3EVW4Dcd7oTJzRjC7oL5MQkkG4xYXWAILakTY3BRUckQdYQPDqSxeJl-F",
  },
];

// Helper function to format location
const formatLocation = (location: any): string => {
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
};

// Helper function to map API product to Home Product type
const mapApiProductToHomeProduct = (apiProduct: any): Product => {
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
};

// Helper function to format price
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

export default function HomePage() {
  // Fetch data from API
  const { 
    data: newestProducts = [], 
    isLoading: isLoadingNewest, 
    isError: isErrorNewest 
  } = useNewestProducts(5);
  
  const { 
    data: recommendedProducts = [], 
    isLoading: isLoadingRecommended,
    isError: isErrorRecommended 
  } = useRecommendedProducts(5);
  
  const { 
    data: categories = [], 
    isLoading: isLoadingCategories,
    isError: isErrorCategories 
  } = useHomeCategories();

  // Map API products to Home Product type
  const mappedNewestProducts: Product[] = useMemo(() => {
    if (!Array.isArray(newestProducts)) {
      console.warn('newestProducts is not an array:', newestProducts);
      return [];
    }
    try {
      return newestProducts.map(mapApiProductToHomeProduct);
    } catch (error) {
      console.error('Error mapping newest products:', error);
      return [];
    }
  }, [newestProducts]);

  const mappedRecommendedProducts: Product[] = useMemo(() => {
    if (!Array.isArray(recommendedProducts)) {
      console.warn('recommendedProducts is not an array:', recommendedProducts);
      return [];
    }
    try {
      return recommendedProducts.map(mapApiProductToHomeProduct);
    } catch (error) {
      console.error('Error mapping recommended products:', error);
      return [];
    }
  }, [recommendedProducts]);

  // Map API categories to Home Category type
  const mappedCategories: Category[] = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories
      .filter((cat: any) => cat && (cat.isActive !== false))
      .slice(0, 6) // Limit to 6 categories
      .map((cat: any) => ({
        name: cat.name || '',
        imageUrl: cat.image || 'https://placehold.co/200x200',
      }));
  }, [categories]);

  return (
    <PageLayout>
      <HeroSection backgroundImage={HERO_BG} />
      <TrustIndicators />
      
      {isLoadingCategories ? (
        <div className="w-full max-w-[1280px] px-4 md:px-8 py-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        </div>
      ) : isErrorCategories ? (
        <div className="w-full max-w-[1280px] px-4 md:px-8 py-6">
          <div className="text-center text-gray-500">Không thể tải danh mục</div>
        </div>
      ) : mappedCategories.length > 0 ? (
        <CategoryGrid items={mappedCategories} />
      ) : null}

      {isLoadingNewest ? (
        <div className="w-full max-w-[1280px] px-4 md:px-8 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        </div>
      ) : isErrorNewest ? (
        <div className="w-full max-w-[1280px] px-4 md:px-8 py-6">
          <div className="text-center text-gray-500">Không thể tải sản phẩm mới</div>
        </div>
      ) : mappedNewestProducts.length > 0 ? (
        <ProductSection
          title="Mới đăng bán"
          icon="new_releases"
          iconBgClassName="bg-[var(--color-primary)]"
          items={mappedNewestProducts}
          showMoreButton
          moreButtonLabel="Xem thêm sản phẩm mới"
        />
      ) : null}

      <PromoBanners items={BANNERS} />

      {isLoadingRecommended ? (
        <div className="w-full max-w-[1280px] px-4 md:px-8 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        </div>
      ) : isErrorRecommended ? (
        <div className="w-full max-w-[1280px] px-4 md:px-8 py-6">
          <div className="text-center text-gray-500">Không thể tải sản phẩm gợi ý</div>
        </div>
      ) : mappedRecommendedProducts.length > 0 ? (
        <ProductSection
          title="Gợi ý cho bạn"
          icon="local_fire_department"
          iconBgClassName="bg-red-500"
          items={mappedRecommendedProducts}
        />
      ) : null}
    </PageLayout>
  );
}
