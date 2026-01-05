import axios from "@/config/axios";
import type { ApiResponse } from "@/types/auth";

const REVIEW_PREFIX = "/v1/reviews";

export interface Review {
  _id: string;
  order: string;
  customer: {
    _id: string;
    name: string;
    avatar?: string;
  };
  seller: string;
  product: {
    _id: string;
    title: string;
    images?: string[];
  };
  rating: number;
  comment?: string;
  images?: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewPayload {
  orderId: string;
  productId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface OrderReviewStatus {
  canReview: boolean;
  orderStatus: string;
  products: Array<{
    productId: string;
    productName: string;
    productImage?: string;
    quantity: number;
    price: number;
    isReviewed: boolean;
  }>;
  allReviewed: boolean;
}

export const reviewService = {
  async createReview(payload: CreateReviewPayload): Promise<ApiResponse<{ review: Review }>> {
    const res = await axios.post(`${REVIEW_PREFIX}`, payload);
    return res.data;
  },

  async checkOrderReviewStatus(orderId: string): Promise<ApiResponse<{ data: OrderReviewStatus }>> {
    const res = await axios.get(`${REVIEW_PREFIX}/order/${orderId}/check`);
    return res.data;
  },

  async getOrderReviews(orderId: string): Promise<ApiResponse<{ reviews: Review[] }>> {
    const res = await axios.get(`${REVIEW_PREFIX}/order/${orderId}`);
    return res.data;
  },

  async getSellerReviews(sellerId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<{ reviews: Review[]; averageRating: number; totalReviews: number; pagination: any }>> {
    const res = await axios.get(`${REVIEW_PREFIX}/seller/${sellerId}`, { params });
    return res.data;
  },

  async getProductReviews(productId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<{ reviews: Review[]; pagination: any }>> {
    const res = await axios.get(`${REVIEW_PREFIX}/product/${productId}`, { params });
    return res.data;
  },
};


