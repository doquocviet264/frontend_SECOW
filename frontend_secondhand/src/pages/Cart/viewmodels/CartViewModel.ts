/**
 * Cart ViewModel - Business logic và state management
 * Không phụ thuộc vào View cụ thể
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { cartService, type CartItemDto } from "@/services/cartService";
import { useCart } from "@/store/cart";
import type { SellerCartGroup, CartItem } from "../models/CartModel";
import { mapApiCartItemsToGroups } from "../models/CartModel";

export interface CartViewModelState {
  groups: SellerCartGroup[];
  isLoading: boolean;
  error: string | null;
}

export interface CartViewModelActions {
  loadCart: () => Promise<void>;
  toggleAll: () => void;
  toggleSeller: (sellerId: string) => void;
  toggleItem: (itemId: string) => void;
  incrementQuantity: (itemId: string) => Promise<void>;
  decrementQuantity: (itemId: string) => Promise<void>;
  deleteSelected: () => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

export interface CartViewModelComputed {
  allItems: CartItem[];
  totalCount: number;
  allChecked: boolean;
  selectedItems: CartItem[];
  totalItemsSelected: number;
  subtotal: number;
  discount: number;
}

/**
 * Cart ViewModel Hook
 * Quản lý toàn bộ business logic cho Cart page
 */
export function useCartViewModel(): CartViewModelState & CartViewModelActions & CartViewModelComputed {
  const [groups, setGroups] = useState<SellerCartGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cartCount, refreshCart } = useCart();

  // Load cart từ API
  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await cartService.getCart();
      const apiItems = res?.data?.cart?.items || [];
      const mappedGroups = mapApiCartItemsToGroups(apiItems);
      setGroups(mappedGroups);
    } catch (err) {
      setError("Không thể tải giỏ hàng");
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync seller checked state dựa trên items
  const syncSellerChecked = useCallback((next: SellerCartGroup[]): SellerCartGroup[] => {
    return next.map((g) => ({
      ...g,
      checked: g.items.length > 0 && g.items.every((it) => it.checked),
    }));
  }, []);

  // Computed values
  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const totalCount = allItems.length;
  const allChecked = totalCount > 0 && allItems.every((i) => i.checked);
  const selectedItems = allItems.filter((i) => i.checked);
  const totalItemsSelected = selectedItems.reduce((s, i) => s + i.quantity, 0);
  const subtotal = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = 0;

  // Toggle all items
  const toggleAll = useCallback(() => {
    const nextChecked = !allChecked;
    const next = groups.map((g) => ({
      ...g,
      checked: nextChecked,
      items: g.items.map((it) => ({ ...it, checked: nextChecked })),
    }));
    setGroups(next);
  }, [groups, allChecked]);

  // Toggle seller group
  const toggleSeller = useCallback(
    (sellerId: string) => {
      const next = groups.map((g) => {
        if (g.id !== sellerId) return g;
        const nextChecked = !g.checked;
        return {
          ...g,
          checked: nextChecked,
          items: g.items.map((it) => ({ ...it, checked: nextChecked })),
        };
      });
      setGroups(syncSellerChecked(next));
    },
    [groups, syncSellerChecked]
  );

  // Toggle single item
  const toggleItem = useCallback(
    (itemId: string) => {
      const next = groups.map((g) => ({
        ...g,
        items: g.items.map((it) => (it.id === itemId ? { ...it, checked: !it.checked } : it)),
      }));
      setGroups(syncSellerChecked(next));
    },
    [groups, syncSellerChecked]
  );

  // Increment quantity
  const incrementQuantity = useCallback(
    async (itemId: string) => {
      const current = allItems.find((it) => it.id === itemId);
      if (!current) return;
      const nextQty = Math.min(current.quantity + 1, current.stock);
      if (nextQty === current.quantity) return;

      try {
        await cartService.updateItemQuantity(itemId, nextQty);
        await loadCart();
      } catch (err) {
        setError("Không thể cập nhật số lượng");
      }
    },
    [allItems, loadCart]
  );

  // Decrement quantity
  const decrementQuantity = useCallback(
    async (itemId: string) => {
      const current = allItems.find((it) => it.id === itemId);
      if (!current) return;
      const nextQty = Math.max(current.quantity - 1, 1);
      if (nextQty === current.quantity) return;

      try {
        await cartService.updateItemQuantity(itemId, nextQty);
        await loadCart();
      } catch (err) {
        setError("Không thể cập nhật số lượng");
      }
    },
    [allItems, loadCart]
  );

  // Delete selected items
  const deleteSelected = useCallback(async () => {
    const selectedIds = groups.flatMap((g) => g.items.filter((it) => it.checked).map((it) => it.id));
    if (selectedIds.length === 0) return;

    try {
      await cartService.removeItems(selectedIds);
      await refreshCart();
      await loadCart();
    } catch (err) {
      setError("Không thể xóa sản phẩm");
    }
  }, [groups, refreshCart, loadCart]);

  // Remove single item
  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        await cartService.removeItem(itemId);
        await refreshCart();
        await loadCart();
      } catch (err) {
        setError("Không thể xóa sản phẩm");
      }
    },
    [refreshCart, loadCart]
  );

  // Load cart khi cartCount thay đổi
  useEffect(() => {
    loadCart();
  }, [cartCount, loadCart]);

  return {
    // State
    groups,
    isLoading,
    error,
    // Actions
    loadCart,
    toggleAll,
    toggleSeller,
    toggleItem,
    incrementQuantity,
    decrementQuantity,
    deleteSelected,
    removeItem,
    // Computed
    allItems,
    totalCount,
    allChecked,
    selectedItems,
    totalItemsSelected,
    subtotal,
    discount,
  };
}



