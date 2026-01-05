/**
 * Checkout Model - Data structures only
 * Mapping từ API response sang domain model
 */

import type { CartItemDto } from "@/services/cartService";

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  label?: string;
  isDefault?: boolean;
  addressLine: string;
  city?: string;
  district?: string;
  ward?: string;
};

export type CheckoutItem = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  oldPrice?: number;
  tags?: string[];
  shippingLabel?: string;
};

export type SellerCheckoutGroup = {
  id: string;
  name: string;
  canChat?: boolean;
  items: CheckoutItem[];
};

export type PaymentMethod = "cod" | "bank" | "wallet";

/**
 * Map API Address to Address model
 */
export function mapApiAddressToModel(apiAddr: any): Address {
  return {
    id: apiAddr._id,
    fullName: apiAddr.receiver,
    phone: apiAddr.phone,
    addressLine: [apiAddr.street, apiAddr.ward, apiAddr.district, apiAddr.city].filter(Boolean).join(", "),
    city: apiAddr.city,
    district: apiAddr.district,
    ward: apiAddr.ward,
    label: apiAddr.label,
    isDefault: apiAddr.isDefault,
  };
}

/**
 * Map API CartItems to SellerCheckoutGroup model
 */
export function mapApiCartItemsToCheckoutGroups(
  items: CartItemDto[],
  selectedIds?: string[]
): SellerCheckoutGroup[] {
  const filtered = selectedIds && selectedIds.length > 0 
    ? items.filter((it) => selectedIds.includes(it.id))
    : items;

  if (filtered.length === 0) {
    return [];
  }

  const checkoutItems: CheckoutItem[] = filtered.map((it) => ({
    id: it.id,
    title: it.product?.title || "Sản phẩm",
    imageUrl: it.product?.image || "",
    price: (it.product?.price || 0) * (it.quantity || 1),
    tags: [`Số lượng: ${it.quantity || 1}`],
  }));

  return [
    {
      id: "g1",
      name: "Giỏ hàng của bạn",
      items: checkoutItems,
    },
  ];
}



