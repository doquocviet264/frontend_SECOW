/**
 * Checkout ViewModel - Business logic và state management
 * Không phụ thuộc vào View cụ thể
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { cartService } from "@/services/cartService";
import { addressService } from "@/services/addressService";
import { orderService } from "@/services/orderService";
import { useCart } from "@/store/cart";
import type { Address, SellerCheckoutGroup, PaymentMethod } from "../models/CheckoutModel";
import { mapApiAddressToModel, mapApiCartItemsToCheckoutGroups } from "../models/CheckoutModel";

export interface CheckoutViewModelState {
  addresses: Address[];
  selectedAddressId: string;
  paymentMethod: PaymentMethod;
  sellers: SellerCheckoutGroup[];
  isLoading: boolean;
  error: string | null;
}

export interface CheckoutViewModelActions {
  loadCheckoutData: () => Promise<void>;
  selectAddress: (addressId: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  addAddress: (address: Address) => void;
  placeOrder: () => Promise<string | null>;
}

export interface CheckoutViewModelComputed {
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  shippingDiscount: number;
  total: number;
}

/**
 * Checkout ViewModel Hook
 * Quản lý toàn bộ business logic cho Checkout page
 */
export function useCheckoutViewModel(): CheckoutViewModelState & CheckoutViewModelActions & CheckoutViewModelComputed {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [sellers, setSellers] = useState<SellerCheckoutGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCart } = useCart();

  // Load checkout data (cart items và addresses)
  const loadCheckoutData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load cart items
      const selectedStr = sessionStorage.getItem("checkoutSelectedItemIds");
      const selectedIds: string[] = selectedStr ? JSON.parse(selectedStr) : [];

      const cartRes = await cartService.getCart();
      const items = cartRes?.data?.cart?.items || [];
      const mappedSellers = mapApiCartItemsToCheckoutGroups(items, selectedIds);
      setSellers(mappedSellers);

      // Load addresses
      const addrRes = await addressService.getUserAddresses();
      const apiAddrs = addrRes?.data?.addresses || [];
      const mappedAddresses = apiAddrs.map(mapApiAddressToModel);
      setAddresses(mappedAddresses);

      // Set default address
      const defaultAddr = apiAddrs.find((a: any) => a.isDefault);
      setSelectedAddressId(defaultAddr?._id || mappedAddresses[0]?.id || "");
    } catch (err) {
      setError("Không thể tải dữ liệu thanh toán");
      setSellers([]);
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select address
  const selectAddress = useCallback((addressId: string) => {
    setSelectedAddressId(addressId);
  }, []);

  // Add new address
  const addAddress = useCallback((address: Address) => {
    setAddresses((prev) => {
      const shouldBeDefault = prev.length === 0 || address.isDefault;
      const next = shouldBeDefault
        ? [{ ...address, isDefault: true }, ...prev.map((a) => ({ ...a, isDefault: false }))]
        : [address, ...prev];
      return next;
    });
    setSelectedAddressId(address.id);
  }, []);

  // Place order
  const placeOrder = useCallback(async (): Promise<string | null> => {
    const addr = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
    if (!addr) {
      setError("Vui lòng thêm địa chỉ giao hàng.");
      return null;
    }

    const paymentMethodApi =
      paymentMethod === "cod" ? "cod" : paymentMethod === "bank" ? "bank_transfer" : "vnpay";

    try {
      setIsLoading(true);
      const res = await orderService.createOrder({
        shippingAddress: {
          fullName: addr.fullName,
          phone: addr.phone,
          address: addr.addressLine,
          city: addr.city || "",
          district: addr.district,
          ward: addr.ward,
        },
        paymentMethod: paymentMethodApi,
      });

      const orderId = res?.data?.order?._id;
      await refreshCart();
      return orderId || null;
    } catch (err) {
      setError("Tạo đơn hàng thất bại. Vui lòng thử lại.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [addresses, selectedAddressId, paymentMethod, refreshCart]);

  // Computed values
  const itemCount = useMemo(() => {
    return sellers.reduce((sum, g) => sum + g.items.length, 0);
  }, [sellers]);

  const subtotal = useMemo(() => {
    return sellers.reduce((sum, g) => sum + g.items.reduce((s2, it) => s2 + it.price, 0), 0);
  }, [sellers]);

  const shippingFee = 45000;
  const shippingDiscount = 15000;
  const total = subtotal + shippingFee - shippingDiscount;

  // Load data on mount
  useEffect(() => {
    loadCheckoutData();
  }, [loadCheckoutData]);

  return {
    // State
    addresses,
    selectedAddressId,
    paymentMethod,
    sellers,
    isLoading,
    error,
    // Actions
    loadCheckoutData,
    selectAddress,
    setPaymentMethod,
    addAddress,
    placeOrder,
    // Computed
    itemCount,
    subtotal,
    shippingFee,
    shippingDiscount,
    total,
  };
}



