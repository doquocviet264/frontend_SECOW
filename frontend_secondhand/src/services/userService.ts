import axios from "@/config/axios";
import type { ApiResponse } from "@/types/auth";

const USER_PREFIX = "/v1/auth";

export interface AddressData {
  street: string;
  city: string;
  district?: string;
  ward?: string;
}

export interface UpdateAddressPayload {
  address: AddressData;
}

export const userService = {
  // Cập nhật địa chỉ người dùng
  async updateAddress(payload: UpdateAddressPayload): Promise<ApiResponse> {
    const res = await axios.put(`${USER_PREFIX}/profile`, payload);
    return res.data;
  },

  // Cập nhật thông tin cá nhân (bao gồm địa chỉ)
  async updateProfile(data: {
    name?: string;
    phone?: string;
    address?: AddressData;
    avatar?: string;
  }): Promise<ApiResponse> {
    const res = await axios.put(`${USER_PREFIX}/profile`, data);
    return res.data;
  },
};
