import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/categoryService';

export const useHomeCategories = () => {
  return useQuery({
    queryKey: ['home', 'categories'],
    queryFn: async () => {
      try {
        const response = await categoryService.getCategories();
        // Backend trả về: { success: true, data: { categories: [...] } }
        if (response && response.data) {
          if (response.data.categories && Array.isArray(response.data.categories)) {
            return response.data.categories;
          }
          if (Array.isArray(response.data)) {
            return response.data;
          }
        }
        return [];
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

