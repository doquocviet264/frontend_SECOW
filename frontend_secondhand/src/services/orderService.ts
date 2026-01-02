import axios from "@/config/axios";
import type { ApiResponse } from "@/types/auth";

const ORDER_PREFIX = "/v1/orders";

export interface GetOrdersParams {
  status?: string;
  page?: number;
  limit?: number;
}

export interface OrderItem {
  product: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district?: string;
    ward?: string;
  };
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "rejected";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "cod" | "bank_transfer" | "stripe" | "vnpay";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const orderService = {
  async getMyOrders(params?: GetOrdersParams): Promise<ApiResponse<{ orders: Order[]; pagination: any }>> {
    const res = await axios.get(`${ORDER_PREFIX}`, { params });
    return res.data;
  },

  async getOrderById(id: string): Promise<ApiResponse<{ order: Order }>> {
    const res = await axios.get(`${ORDER_PREFIX}/${id}`);
    return res.data;
  },
};

