/**
 * Cart Model - Data structures only
 * Mapping từ API response sang domain model
 */

import type { CartItemDto } from "@/services/cartService";

export type CartItem = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  oldPrice?: number;
  badges?: string[];
  conditionTag?: { label: string; tone: "green" | "yellow" | "red" };
  color?: string;
  size?: string;
  stock: number;
  quantity: number;
  checked: boolean;
};

export type SellerCartGroup = {
  id: string;
  name: string;
  verified?: boolean;
  checked: boolean;
  items: CartItem[];
};

export type RecommendationItem = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  oldPrice?: number;
};

/**
 * Map API CartItemDto to CartItem model
 */
export function mapApiCartItemToModel(dto: CartItemDto): CartItem {
  return {
    id: dto.id,
    title: dto.product?.title || "Sản phẩm",
    imageUrl: dto.product?.image || "",
    price: dto.product?.price || 0,
    stock: dto.product?.stock || 0,
    quantity: dto.quantity || 1,
    checked: false,
  };
}

/**
 * Map API CartItems to SellerCartGroup model
 */
export function mapApiCartItemsToGroups(items: CartItemDto[]): SellerCartGroup[] {
  if (items.length === 0) {
    return [];
  }

  const cartItems = items.map(mapApiCartItemToModel);
  
  return [
    {
      id: "g1",
      name: "Giỏ hàng của bạn",
      verified: false,
      checked: false,
      items: cartItems,
    },
  ];
}



