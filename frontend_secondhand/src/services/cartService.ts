import axios from "@/config/axios";

const CART_PREFIX = "/v1/cart";

export type CartItemDto = {
  id: string;
  quantity: number;
  product?: {
    id: string;
    title: string;
    price: number;
    image?: string | null;
    stock: number;
  };
};

export type CartResponse = {
  success: boolean;
  data: {
    cart: {
      id: string;
      items: CartItemDto[];
      total: number;
      itemCount: number;
    };
  };
};

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const res = await axios.get(`${CART_PREFIX}`);
    return res.data;
  },

  async addItem(payload: { productId: string; quantity: number }): Promise<CartResponse> {
    const res = await axios.post(`${CART_PREFIX}/items`, payload);
    return res.data;
  },

  async updateItemQuantity(itemId: string, quantity: number): Promise<CartResponse> {
    const res = await axios.put(`${CART_PREFIX}/items/${itemId}`, { quantity });
    return res.data;
  },

  async removeItem(itemId: string): Promise<CartResponse> {
    const res = await axios.delete(`${CART_PREFIX}/items/${itemId}`);
    return res.data;
  },

  async removeItems(itemIds: string[]): Promise<void> {
    // Thực hiện tuần tự để tránh race-condition ghi đè cart trên server
    for (const id of itemIds) {
      // eslint-disable-next-line no-await-in-loop
      await axios.delete(`${CART_PREFIX}/items/${id}`);
    }
  },
};


