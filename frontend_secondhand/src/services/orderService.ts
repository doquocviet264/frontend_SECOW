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

  async createOrder(payload: {
    shippingAddress: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      district?: string;
      ward?: string;
    };
    paymentMethod?: "cod" | "bank_transfer" | "stripe" | "vnpay";
    notes?: string;
  }): Promise<ApiResponse<{ order: Order }>> {
    const res = await axios.post(`${ORDER_PREFIX}`, payload);
    return res.data;
  },

  // Seller APIs
  async getSellerOrders(params?: GetOrdersParams): Promise<ApiResponse<{ orders: Order[]; pagination: any }>> {
    const res = await axios.get(`${ORDER_PREFIX}/seller/list`, { params });
    return res.data;
  },

  async confirmOrder(id: string): Promise<ApiResponse<{ order: Order }>> {
    const res = await axios.put(`${ORDER_PREFIX}/${id}/confirm`);
    return res.data;
  },

  async rejectOrder(id: string, reason?: string): Promise<ApiResponse<{ order: Order }>> {
    const res = await axios.put(`${ORDER_PREFIX}/${id}/reject`, { reason });
    return res.data;
  },

  async updateOrderStatus(id: string, status: "processing" | "shipped"): Promise<ApiResponse<{ order: Order }>> {
    const res = await axios.put(`${ORDER_PREFIX}/${id}/status`, { status });
    return res.data;
  },

  // Customer APIs
  async confirmDelivery(id: string): Promise<ApiResponse<{ order: Order }>> {
    const res = await axios.put(`${ORDER_PREFIX}/${id}/confirm-delivery`);
    return res.data;
  },

  async cancelOrder(id: string, reason?: string): Promise<ApiResponse<{ order: Order }>> {
    const res = await axios.put(`${ORDER_PREFIX}/${id}/cancel`, { reason });
    return res.data;
  },
};

