/**
 * Products ViewModel - Business logic và state management
 * Không phụ thuộc vào View cụ thể
 */

import { useState, useMemo, useCallback } from "react";
import type { ProductModel, CategoryModel, FilterState, ViewMode, LocationData } from "../models/ProductModel";
import { mapApiProductToModel, formatPrice } from "../models/ProductModel";
import { useProductRequest } from "../hooks/UseProductRequest";
import { useCategories } from "../hooks/useCategories";

export interface ProductsViewModelState {
  viewMode: ViewMode;
  sortOption: string;
  currentPage: number;
  filters: FilterState;
  isLoading: boolean;
  isLoadingCategories: boolean;
  isError: boolean;
}

export interface ProductsViewModelActions {
  setViewMode: (mode: ViewMode) => void;
  setSortOption: (option: string) => void;
  setCurrentPage: (page: number) => void;
  updateFilters: (newFilters: Partial<FilterState>) => void;
  clearFilters: () => void;
}

export interface ProductsViewModelComputed {
  filteredProducts: ProductModel[];
  currentItems: ProductModel[];
  totalPages: number;
  totalCount: number;
}

const ITEMS_PER_PAGE = 6;

/**
 * Normalize location name for comparison
 */
function normalizeLocationName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[.,\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/thành phố\s*/gi, '')
    .replace(/tp\s*/gi, '')
    .replace(/tỉnh\s*/gi, '')
    .replace(/hồ chí minh/gi, 'ho chi minh')
    .replace(/hà nội/gi, 'ha noi')
    .replace(/đà nẵng/gi, 'da nang');
}

/**
 * Check if two location names match
 */
function isLocationMatch(name1: string, name2: string): boolean {
  if (!name1 || !name2) return false;
  const normalized1 = normalizeLocationName(name1);
  const normalized2 = normalizeLocationName(name2);
  
  if (normalized1 === normalized2) return true;
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return true;
  
  return false;
}

/**
 * Products ViewModel Hook
 * Quản lý toàn bộ business logic cho Products page
 */
export function useProductsViewModel(): ProductsViewModelState & ProductsViewModelActions & ProductsViewModelComputed {
  // React Query hooks
  const { data: products = [], isLoading, isError } = useProductRequest();
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    categoryIds: [],
    locations: [],
    conditions: [],
    priceRange: { min: 0, max: 50000000 },
    selectedCity: '',
    selectedDistrict: ''
  });

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      categoryIds: [],
      locations: [],
      conditions: [],
      priceRange: { min: 0, max: 50000000 },
      selectedCity: '',
      selectedDistrict: ''
    });
    setCurrentPage(1);
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  // Map and filter products
  const filteredProducts = useMemo(() => {
    // Map API products to ProductModel
    const mappedProducts = products.map((p: any) => {
      const locationData = typeof p.location === 'object' ? p.location : null;
      const locationString = typeof p.location === 'string' ? p.location : (p.location?.city || '');
      
      return {
        product: mapApiProductToModel(p, formatPrice),
        locationData,
        locationString
      };
    });

    // Filter by category
    let filteredByCategory = mappedProducts;
    if (filters.categoryIds.length > 0) {
      filteredByCategory = mappedProducts.filter((item) => 
        filters.categoryIds.includes(item.product.categoryId)
      );
    }

    // Filter by location
    let filteredByLocation = filteredByCategory;
    if (filters.locations.length > 0 || filters.selectedCity) {
      filteredByLocation = filteredByCategory.filter((item) => {
        const { locationData, locationString } = item;
        
        // If both city and district selected
        if (filters.selectedCity && filters.selectedDistrict) {
          const cityMatch = locationData
            ? isLocationMatch(locationData.city || '', filters.selectedCity)
            : isLocationMatch(locationString || '', filters.selectedCity);
          
          const districtMatch = locationData
            ? isLocationMatch(locationData.district || '', filters.selectedDistrict)
            : isLocationMatch(locationString || '', filters.selectedDistrict);
          
          return cityMatch && districtMatch;
        }
        
        // If only city selected
        if (filters.selectedCity) {
          const cityMatch = locationData
            ? isLocationMatch(locationData.city || '', filters.selectedCity)
            : isLocationMatch(locationString || '', filters.selectedCity);
          return cityMatch;
        }
        
        // Filter by locations array (backward compatibility)
        if (filters.locations.length > 0) {
          return filters.locations.some(loc => {
            if (locationData) {
              return isLocationMatch(locationData.city || '', loc) ||
                     isLocationMatch(locationData.district || '', loc) ||
                     isLocationMatch(locationString || '', loc);
            }
            return isLocationMatch(locationString || '', loc);
          });
        }
        
        return true;
      });
    }

    // Get products only
    let result = filteredByLocation.map(item => item.product);

    // Filter by price range
    result = result.filter(
      (p) => p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
    );

    // Sort
    if (sortOption === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    }
    if (sortOption === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [filters, sortOption, products]);

  // Pagination
  const currentItems = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredProducts, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  }, [filteredProducts]);

  return {
    // State
    viewMode,
    sortOption,
    currentPage,
    filters,
    isLoading,
    isLoadingCategories,
    isError,
    // Actions
    setViewMode,
    setSortOption,
    setCurrentPage,
    updateFilters,
    clearFilters,
    // Computed
    filteredProducts,
    currentItems,
    totalPages,
    totalCount: filteredProducts.length,
  };
}



