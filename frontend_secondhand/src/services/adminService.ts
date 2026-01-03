import axios from "@/config/axios";
import type { ApiResponse } from "@/types/auth";
import type { Store } from "./storeService";

const ADMIN_PREFIX = "/v1/admin";

export interface PendingStore extends Store {
  seller: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface PendingStoresResponse {
  stores: PendingStore[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AllStoresResponse {
  stores: Store[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "seller" | "admin";
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SystemStats {
  stats: {
    users: {
      total: number;
      sellers: number;
      active: number;
    };
    products: {
      total: number;
      active: number;
      pending: number;
    };
    orders: {
      total: number;
      pending: number;
      delivered: number;
    };
    revenue: {
      total: number;
    };
    stores: {
      total: number;
      approved: number;
      pending: number;
    };
    categories: {
      total: number;
    };
  };
}

export interface RevenueChartData {
  name: string;
  value: number;
  orderCount: number;
}

export interface RevenueChartResponse {
  chartData: RevenueChartData[];
}

export interface UserGrowthChartData {
  name: string;
  value: number;
}

export interface UserGrowthChartResponse {
  chartData: UserGrowthChartData[];
  totalNewUsers: number;
  growthPercent: number;
}

export interface PendingProduct {
  _id: string;
  name: string;
  price: number;
  images: string[];
  status: string;
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface PendingProductsResponse {
  products: PendingProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminService = {
  // Lấy thống kê hệ thống
  async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    const res = await axios.get(`${ADMIN_PREFIX}/stats`);
    return res.data;
  },

  // Lấy dữ liệu biểu đồ doanh thu
  async getRevenueChart(days?: number): Promise<ApiResponse<RevenueChartResponse>> {
    const res = await axios.get(`${ADMIN_PREFIX}/stats/revenue-chart`, { params: { days } });
    return res.data;
  },

  // Lấy dữ liệu tăng trưởng người dùng
  async getUserGrowthChart(): Promise<ApiResponse<UserGrowthChartResponse>> {
    const res = await axios.get(`${ADMIN_PREFIX}/stats/user-growth`);
    return res.data;
  },

  // Lấy danh sách cửa hàng chờ phê duyệt
  async getPendingStores(params?: { page?: number; limit?: number }): Promise<ApiResponse<PendingStoresResponse>> {
    const res = await axios.get(`${ADMIN_PREFIX}/stores/pending`, { params });
    return res.data;
  },

  // Phê duyệt cửa hàng
  async approveStore(storeId: string): Promise<ApiResponse<{ store: Store }>> {
    const res = await axios.put(`${ADMIN_PREFIX}/stores/${storeId}/approve`);
    return res.data;
  },

  // Từ chối cửa hàng
  async rejectStore(storeId: string, reason?: string): Promise<ApiResponse> {
    const res = await axios.put(`${ADMIN_PREFIX}/stores/${storeId}/reject`, { reason });
    return res.data;
  },

  // Lấy danh sách người dùng
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: "user" | "seller" | "admin";
    isActive?: boolean;
  }): Promise<ApiResponse<UsersResponse>> {
    const res = await axios.get(`${ADMIN_PREFIX}/users`, { params });
    return res.data;
  },

  // Cập nhật trạng thái người dùng (khóa/mở khóa)
  async updateUserStatus(userId: string, isActive: boolean): Promise<ApiResponse<{ user: User }>> {
    const res = await axios.put(`${ADMIN_PREFIX}/users/${userId}/status`, { isActive });
    return res.data;
  },

  // Lấy danh sách tất cả cửa hàng (đã phê duyệt)
  async getAllStores(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<ApiResponse<AllStoresResponse>> {
    const res = await axios.get(`${ADMIN_PREFIX}/stores`, { params });
    return res.data;
  },

  // Cập nhật trạng thái cửa hàng (khóa/mở khóa)
  async updateStoreStatus(storeId: string, isActive: boolean): Promise<ApiResponse<{ store: Store }>> {
    const res = await axios.put(`${ADMIN_PREFIX}/stores/${storeId}/status`, { isActive });
    return res.data;
  },

  // Lấy danh sách sản phẩm chờ duyệt
  async getPendingProducts(params?: { page?: number; limit?: number }): Promise<ApiResponse<PendingProductsResponse>> {
    const res = await axios.get(`${ADMIN_PREFIX}/products/pending`, { params });
    return res.data;
  },

  // Cập nhật trạng thái sản phẩm
  async updateProductStatus(productId: string, status: string, violationReason?: string): Promise<ApiResponse<{ product: PendingProduct }>> {
    const res = await axios.put(`${ADMIN_PREFIX}/products/${productId}/status`, { status, violationReason });
    return res.data;
  },
};

