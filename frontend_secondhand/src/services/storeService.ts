import axios from "@/config/axios";
import type { ApiResponse } from "@/types/auth";

const STORE_PREFIX = "/v1/stores";

export interface RegisterStorePayload {
  storeName: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  coverImage?: string;
}

export interface UpdateStorePayload {
  storeName?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  coverImage?: string;
}

export interface Store {
  _id: string;
  seller: string | { _id: string; name?: string; email?: string; phone?: string; avatar?: string };
  storeName: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  address: string;
  phone: string;
  email: string;
  isApproved: boolean;
  isActive?: boolean;
  approvedAt?: string;
  approvedBy?: string;
  rating: {
    average: number;
    count: number;
  };
  totalSales: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export const storeService = {
  // Đăng ký trở thành người bán
  async registerStore(payload: RegisterStorePayload): Promise<ApiResponse<{ store: Store }>> {
    const res = await axios.post(`${STORE_PREFIX}/register`, payload);
    return res.data;
  },

  // Lấy thông tin cửa hàng của tôi
  async getMyStore(): Promise<ApiResponse<{ store: Store }>> {
    const res = await axios.get(`${STORE_PREFIX}/me`);
    return res.data;
  },

  // Lấy thông tin cửa hàng theo ID
  async getStoreById(id: string): Promise<ApiResponse<{ store: Store }>> {
    const res = await axios.get(`${STORE_PREFIX}/${id}`);
    return res.data;
  },

  // Lấy thông tin cửa hàng theo seller ID
  async getStoreBySellerId(sellerId: string): Promise<ApiResponse<{ store: Store }>> {
    const res = await axios.get(`${STORE_PREFIX}/seller/${sellerId}`);
    return res.data;
  },

  // Cập nhật thông tin cửa hàng
  async updateStore(payload: UpdateStorePayload): Promise<ApiResponse<{ store: Store }>> {
    const res = await axios.put(`${STORE_PREFIX}/me`, payload);
    return res.data;
  },

  // Lấy thống kê cửa hàng
  async getStoreStats(): Promise<ApiResponse<{
    stats: {
      revenue: {
        today: number;
        todayChange: number;
        sevenDays: number;
        sevenDaysChange: number;
        thirtyDays: number;
        thirtyDaysChange: number;
        total: number;
      };
      chartData: Array<{ name: string; value: number }>;
      orders: {
        total: number;
        pending: number;
        confirmed: number;
        delivered: number;
        cancelled: number;
      };
      recentOrders: Array<{
        _id: string;
        orderNumber: string;
        items: Array<{
          productName: string;
          productImage?: string;
          quantity: number;
        }>;
        totalAmount: number;
        status: string;
        createdAt: string;
      }>;
      products: {
        total: number;
        active: number;
        outOfStock: number;
        pending: number;
        violation: number;
      };
      rating: {
        average: number;
        count: number;
      };
    };
  }>> {
    const res = await axios.get(`${STORE_PREFIX}/me/stats`);
    return res.data;
  },
};

