/**
 * Home ViewModel - Business logic và state management
 * Không phụ thuộc vào View cụ thể
 */

import { useMemo } from "react";
import { useNewestProducts, useRecommendedProducts } from "../hooks/useHomeProducts";
import { useHomeCategories } from "../hooks/useCategories";
import type { Category, Product } from "../models/HomeModel";
import { mapApiProductToHomeProduct, mapApiCategoriesToHomeCategories } from "../models/HomeModel";

export interface HomeViewModelState {
  isLoadingNewest: boolean;
  isLoadingRecommended: boolean;
  isLoadingCategories: boolean;
  isErrorNewest: boolean;
  isErrorRecommended: boolean;
  isErrorCategories: boolean;
}

export interface HomeViewModelComputed {
  newestProducts: Product[];
  recommendedProducts: Product[];
  categories: Category[];
}

/**
 * Home ViewModel Hook
 * Quản lý toàn bộ business logic cho Home page
 */
export function useHomeViewModel(): HomeViewModelState & HomeViewModelComputed {
  // Fetch data from API
  const { 
    data: newestProductsApi = [], 
    isLoading: isLoadingNewest, 
    isError: isErrorNewest 
  } = useNewestProducts(5);
  
  const { 
    data: recommendedProductsApi = [], 
    isLoading: isLoadingRecommended,
    isError: isErrorRecommended 
  } = useRecommendedProducts(5);
  
  const { 
    data: categoriesApi = [], 
    isLoading: isLoadingCategories,
    isError: isErrorCategories 
  } = useHomeCategories();

  // Map API products to Home Product type
  const newestProducts: Product[] = useMemo(() => {
    if (!Array.isArray(newestProductsApi)) {
      console.warn('newestProducts is not an array:', newestProductsApi);
      return [];
    }
    try {
      return newestProductsApi.map(mapApiProductToHomeProduct);
    } catch (error) {
      console.error('Error mapping newest products:', error);
      return [];
    }
  }, [newestProductsApi]);

  const recommendedProducts: Product[] = useMemo(() => {
    if (!Array.isArray(recommendedProductsApi)) {
      console.warn('recommendedProducts is not an array:', recommendedProductsApi);
      return [];
    }
    try {
      return recommendedProductsApi.map(mapApiProductToHomeProduct);
    } catch (error) {
      console.error('Error mapping recommended products:', error);
      return [];
    }
  }, [recommendedProductsApi]);

  // Map API categories to Home Category type
  const categories: Category[] = useMemo(() => {
    return mapApiCategoriesToHomeCategories(categoriesApi);
  }, [categoriesApi]);

  return {
    // State
    isLoadingNewest,
    isLoadingRecommended,
    isLoadingCategories,
    isErrorNewest,
    isErrorRecommended,
    isErrorCategories,
    // Computed
    newestProducts,
    recommendedProducts,
    categories,
  };
}



