import axios from "@/config/axios";
import type { Category, ApiResponse } from "@/types/product";

const CATEGORY_PREFIX = "/v1/categories";

export interface CategoryPayload {
  name: string;
  parentId?: string | null;
  image?: string | File;
  isActive: boolean;
}

export const categoryService = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const res = await axios.get(CATEGORY_PREFIX);
    return res.data;
  },
  async getParentCategories(): Promise<ApiResponse<Category[]>> {
    const res = await axios.get(`${CATEGORY_PREFIX}/parents`); 
    return res.data;
  },
  async getCategoriesForAdmin({ page = 1, limit = 10 }: { page?: number; limit?: number }): Promise<
    ApiResponse<{
      categories: Category[];
      currentPage: number;
      totalPages: number;
      totalCategories: number;
      totalPageItems: number;
    }>
  > {
    const res = await axios.get(`${CATEGORY_PREFIX}/admin`, {
      params: { page, limit },
    });
    console.log(res.data);
    return res.data;
  },

  async createCategory(payload: CategoryPayload): Promise<ApiResponse<Category>> {
    const formData = new FormData();
    formData.append("name", payload.name);
    if (payload.image instanceof File) {
      formData.append("image", payload.image);
    }
    if (payload.parentId) {
      formData.append("parentId", payload.parentId);
    }
    formData.append("isActive", String(payload.isActive));

    const res = await axios.post(CATEGORY_PREFIX, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async updateCategory(_id: string, payload: CategoryPayload): Promise<ApiResponse<Category>> {
    const formData = new FormData();
    formData.append("name", payload.name);

    if (payload.image instanceof File) {
      formData.append("image", payload.image);
    } else if (typeof payload.image === "string") {
      formData.append("image", payload.image);
    }

    if (payload.parentId) formData.append("parentId", payload.parentId);
    formData.append("isActive", String(payload.isActive));

    const res = await axios.put(`${CATEGORY_PREFIX}/${_id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async disableCategory(id: string): Promise<ApiResponse<null>> {
    const res = await axios.patch(`${CATEGORY_PREFIX}/${id}/disable`);
    return res.data;
  },
};