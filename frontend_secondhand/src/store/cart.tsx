import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cartService, type CartItemDto } from "@/services/cartService";
import { authService } from "@/services/authService";

type CartContextValue = {
  cartCount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const computeCount = (list: CartItemDto[]) => list.length;

  const cartCount = useMemo(() => computeCount(items), [items]);

  const refreshCart = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await cartService.getCart();
      setItems(res?.data?.cart?.items || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: string, quantity: number) => {
    if (!authService.isAuthenticated()) {
      window.location.href = "/auth/signin";
      return;
    }
    await cartService.addItem({ productId, quantity });
    await refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const value = useMemo(
    () => ({ cartCount, isLoading, refreshCart, addToCart }),
    [cartCount, isLoading, refreshCart, addToCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}


