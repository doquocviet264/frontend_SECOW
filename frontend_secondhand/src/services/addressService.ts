// Service để lấy dữ liệu địa chỉ Việt Nam từ API công khai
// Sử dụng API: https://provinces.open-api.vn/

export interface Province {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  province_code: string;
}

export interface Ward {
  code: string;
  name: string;
  district_code: string;
}

const API_BASE_URL = "https://provinces.open-api.vn/api";

export const addressService = {
  // Lấy danh sách tất cả tỉnh/thành phố
  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/p/`);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách tỉnh/thành phố");
      }
      const data = await response.json();
      // Normalize: đảm bảo code luôn là string để tránh lỗi so sánh
      return data.map((p: any) => ({
        ...p,
        code: String(p.code),
      }));
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw error;
    }
  },

  // Lấy danh sách quận/huyện theo mã tỉnh/thành phố
  async getDistrictsByProvince(provinceCode: string): Promise<District[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách quận/huyện");
      }
      const data = await response.json();
      const districts = data.districts || [];
      // Normalize: đảm bảo code luôn là string để tránh lỗi so sánh
      return districts.map((d: any) => ({
        ...d,
        code: String(d.code),
        province_code: String(d.province_code || provinceCode),
      }));
    } catch (error) {
      console.error("Error fetching districts:", error);
      throw error;
    }
  },

  // Lấy danh sách phường/xã theo mã quận/huyện
  async getWardsByDistrict(districtCode: string): Promise<Ward[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/d/${districtCode}?depth=2`);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách phường/xã");
      }
      const data = await response.json();
      const wards = data.wards || [];
      // Normalize: đảm bảo code luôn là string để tránh lỗi so sánh
      return wards.map((w: any) => ({
        ...w,
        code: String(w.code),
        district_code: String(w.district_code || districtCode),
      }));
    } catch (error) {
      console.error("Error fetching wards:", error);
      throw error;
    }
  },

  // Tìm mã tỉnh/thành phố theo tên (tìm kiếm không phân biệt hoa thường)
  async findProvinceCodeByName(name: string): Promise<string | null> {
    try {
      const provinces = await this.getProvinces();
      const normalizedName = name.toLowerCase().trim();
      const found = provinces.find(
        (p) => p.name.toLowerCase().trim() === normalizedName
      );
      return found ? String(found.code) : null;
    } catch (error) {
      console.error("Error finding province code:", error);
      return null;
    }
  },

  // Tìm mã quận/huyện theo tên và mã tỉnh
  async findDistrictCodeByName(provinceCode: string, name: string): Promise<string | null> {
    try {
      const districts = await this.getDistrictsByProvince(provinceCode);
      const normalizedName = name.toLowerCase().trim();
      const found = districts.find(
        (d) => d.name.toLowerCase().trim() === normalizedName
      );
      return found ? String(found.code) : null;
    } catch (error) {
      console.error("Error finding district code:", error);
      return null;
    }
  },

  // Tìm mã phường/xã theo tên và mã quận/huyện
  async findWardCodeByName(districtCode: string, name: string): Promise<string | null> {
    try {
      const wards = await this.getWardsByDistrict(districtCode);
      const normalizedName = name.toLowerCase().trim();
      const found = wards.find(
        (w) => w.name.toLowerCase().trim() === normalizedName
      );
      return found ? String(found.code) : null;
    } catch (error) {
      console.error("Error finding ward code:", error);
      return null;
    }
  },
};

