import axios from "@/config/axios";
import type { Product, ApiResponse } from "@/types/product";

const PRODUCT_PREFIX = "/v1/products";

export interface GetSellerProductsParams {
  status?: string;
  title?: string;
  categoryId?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export const productService = {
  async getSellerProducts(
    params: GetSellerProductsParams
  ): Promise<ApiResponse<{ products: Product[] }>> {
    const res = await axios.get(`${PRODUCT_PREFIX}/seller`, { params });
    return res.data;
  },

  async createProduct(formData: FormData): Promise<ApiResponse<Product>> {
    const res = await axios.post(`${PRODUCT_PREFIX}`, formData);
    return res.data;
  },

  async updateProduct(id: string, formData: FormData): Promise<ApiResponse<Product>> {
    const res = await axios.put(`${PRODUCT_PREFIX}/${id}`, formData);
    return res.data;
  },
  async hideProduct(id: string, status: "active" | "hidden"): Promise<ApiResponse<Product>> {
    const res = await axios.patch(`${PRODUCT_PREFIX}/${id}/hide`, { status });
    return res.data;
  },

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const res = await axios.delete(`${PRODUCT_PREFIX}/${id}`);
    return res.data;
  },
  // Lấy danh sách sản phẩm (Admin)
  async getAdminProducts(params: any): Promise<ApiResponse<any>> {
    const res = await axios.get(`${PRODUCT_PREFIX}/admin`, { params });
    return res.data;
  },

  // Duyệt sản phẩm
  async approveProduct(id: string): Promise<ApiResponse<any>> {
    const res = await axios.patch(`${PRODUCT_PREFIX}/${id}/approve`);
    return res.data;
  },

  // Từ chối sản phẩm (kèm lý do)
  async rejectProduct(id: string, violationReason: string): Promise<ApiResponse<any>> {
    const res = await axios.patch(`${PRODUCT_PREFIX}/${id}/reject`, { violationReason });
    return res.data;
  }
};