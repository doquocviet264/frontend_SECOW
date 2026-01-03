import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';

export const useNewestProducts = (limit: number = 5) => {
  return useQuery({
    queryKey: ['home', 'newest-products', limit],
    queryFn: async () => {
      try {
        const response = await productService.getProducts({
          page: 1,
          limit,
          sortBy: 'newest',
        });
        // Kiểm tra cấu trúc response
        if (response && response.data && Array.isArray(response.data.products)) {
          return response.data.products;
        }
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      } catch (error) {
        console.error('Error fetching newest products:', error);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useRecommendedProducts = (limit: number = 5) => {
  return useQuery({
    queryKey: ['home', 'recommended-products', limit],
    queryFn: async () => {
      try {
        // Có thể sử dụng sortBy khác hoặc lấy random products
        // Ở đây tạm thời dùng sortBy views hoặc newest
        const response = await productService.getProducts({
          page: 1,
          limit,
          sortBy: 'newest', // Có thể thay đổi thành logic gợi ý khác
        });
        // Kiểm tra cấu trúc response
        if (response && response.data && Array.isArray(response.data.products)) {
          return response.data.products;
        }
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      } catch (error) {
        console.error('Error fetching recommended products:', error);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

