import axios from "@/config/axios";
import type { ApiResponse } from "@/types/auth";

const USER_PREFIX = "/v1/auth";
const ADDRESS_PREFIX = "/v1/addresses";

export interface AddressData {
  street: string;
  city: string;
  district?: string;
  ward?: string;
}

export interface UpdateAddressPayload {
  address: AddressData;
}

export interface Address {
  _id?: string;
  receiver: string;
  phone: string;
  street: string;
  city: string;
  district?: string;
  ward?: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  label?: string;
  isDefault?: boolean;
}

export interface CreateAddressPayload {
  receiver: string;
  phone: string;
  street: string;
  city: string;
  district?: string;
  ward?: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  label?: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayloadNew {
  receiver?: string;
  phone?: string;
  street?: string;
  city?: string;
  district?: string;
  ward?: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  label?: string;
  isDefault?: boolean;
}

export const userService = {
  // Cập nhật địa chỉ người dùng (legacy - giữ lại để tương thích)
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
    dateOfBirth?: string;
  }): Promise<ApiResponse> {
    const res = await axios.put(`${USER_PREFIX}/profile`, data);
    return res.data;
  },

  // ========== Address Book APIs ==========
  
  // Lấy tất cả địa chỉ
  async getAddresses(): Promise<ApiResponse<{ addresses: Address[] }>> {
    const res = await axios.get(`${ADDRESS_PREFIX}`);
    return res.data;
  },

  // Thêm địa chỉ mới
  async addAddress(payload: CreateAddressPayload): Promise<ApiResponse<{ address: Address }>> {
    const res = await axios.post(`${ADDRESS_PREFIX}`, payload);
    return res.data;
  },

  // Cập nhật địa chỉ
  async updateAddressById(addressId: string, payload: UpdateAddressPayloadNew): Promise<ApiResponse<{ address: Address }>> {
    const res = await axios.put(`${ADDRESS_PREFIX}/${addressId}`, payload);
    return res.data;
  },

  // Xóa địa chỉ
  async deleteAddress(addressId: string): Promise<ApiResponse> {
    const res = await axios.delete(`${ADDRESS_PREFIX}/${addressId}`);
    return res.data;
  },

  // Đặt địa chỉ mặc định
  async setDefaultAddress(addressId: string): Promise<ApiResponse<{ address: Address }>> {
    const res = await axios.put(`${ADDRESS_PREFIX}/${addressId}/set-default`);
    return res.data;
  },
};
