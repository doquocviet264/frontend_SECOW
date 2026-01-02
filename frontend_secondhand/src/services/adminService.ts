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

export const adminService = {
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
};

