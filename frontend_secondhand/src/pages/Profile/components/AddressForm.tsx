import { useState, useEffect } from "react";
import { addressService, type Province, type District, type Ward } from "@/services/addressService";
import { userService } from "@/services/userService";

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    receiver?: string;
    phone?: string;
    street?: string;
    provinceCode?: string;
    districtCode?: string;
    wardCode?: string;
    label?: string;
  };
};

export default function AddressForm({ onSuccess, onCancel, initialData }: Props) {
  const [formData, setFormData] = useState({
    receiver: initialData?.receiver || "",
    phone: initialData?.phone || "",
    street: initialData?.street || "",
    provinceCode: initialData?.provinceCode || "",
    districtCode: initialData?.districtCode || "",
    wardCode: initialData?.wardCode || "",
    label: initialData?.label || "",
    isDefault: false,
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const data = await addressService.getProvinces();
        setProvinces(data);
      } catch (err: any) {
        setError("Không thể tải danh sách tỉnh/thành phố");
        console.error(err);
      } finally {
        setLoadingProvinces(false);
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (!formData.provinceCode) {
      setDistricts([]);
      setWards([]);
      setFormData((prev) => ({ ...prev, districtCode: "", wardCode: "" }));
      return;
    }

    const loadDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const data = await addressService.getDistrictsByProvince(formData.provinceCode);
        setDistricts(data);
        setWards([]);
        setFormData((prev) => ({ ...prev, districtCode: "", wardCode: "" }));
      } catch (err: any) {
        setError("Không thể tải danh sách quận/huyện");
        console.error(err);
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [formData.provinceCode]);

  // Load wards when district changes
  useEffect(() => {
    if (!formData.districtCode) {
      setWards([]);
      setFormData((prev) => ({ ...prev, wardCode: "" }));
      return;
    }

    const loadWards = async () => {
      try {
        setLoadingWards(true);
        const data = await addressService.getWardsByDistrict(formData.districtCode);
        setWards(data);
        setFormData((prev) => ({ ...prev, wardCode: "" }));
      } catch (err: any) {
        setError("Không thể tải danh sách phường/xã");
        console.error(err);
      } finally {
        setLoadingWards(false);
      }
    };

    loadWards();
  }, [formData.districtCode]);

  // Load initial data if provided - try to find codes by matching names if codes not available
  useEffect(() => {
    const loadInitialData = async () => {
      if (!initialData) return;

      let provinceCode = initialData.provinceCode;
      let districtCode = initialData.districtCode;
      let wardCode = initialData.wardCode;

      // If we don't have codes but have names, try to find codes by matching names
      // This happens when editing an address that was saved without codes
      // Note: This requires the parent component to pass city/district/ward names
      // For now, we'll just use codes if available

      if (provinceCode) {
        try {
          const districtData = await addressService.getDistrictsByProvince(provinceCode);
          setDistricts(districtData);
          setFormData((prev) => ({ ...prev, provinceCode }));

          if (districtCode) {
            const wardData = await addressService.getWardsByDistrict(districtCode);
            setWards(wardData);
            setFormData((prev) => ({ ...prev, districtCode }));

            if (wardCode) {
              setFormData((prev) => ({ ...prev, wardCode }));
            }
          }
        } catch (err) {
          console.error("Error loading initial address data:", err);
        }
      }
    };

    loadInitialData();
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.receiver.trim()) {
      setError("Vui lòng nhập tên người nhận");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }

    if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }

    if (!formData.street.trim()) {
      setError("Vui lòng nhập địa chỉ chi tiết");
      return;
    }

    if (!formData.provinceCode) {
      setError("Vui lòng chọn tỉnh/thành phố");
      return;
    }

    if (!formData.districtCode) {
      setError("Vui lòng chọn quận/huyện");
      return;
    }

    if (!formData.wardCode) {
      setError("Vui lòng chọn phường/xã");
      return;
    }

    try {
      setLoading(true);

      const selectedProvince = provinces.find((p) => p.code === formData.provinceCode);
      const selectedDistrict = districts.find((d) => d.code === formData.districtCode);
      const selectedWard = wards.find((w) => w.code === formData.wardCode);

      const addressData = {
        street: formData.street,
        city: selectedProvince?.name || "",
        district: selectedDistrict?.name || "",
        ward: selectedWard?.name || "",
      };

      // Update address along with name and phone if provided
      await userService.updateProfile({
        name: formData.receiver,
        phone: formData.phone,
        address: addressData,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra khi lưu địa chỉ");
      console.error("Error saving address:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
        {initialData ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Tên người nhận <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.receiver}
            onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập tên người nhận"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập số điện thoại"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.provinceCode}
            onChange={(e) => setFormData({ ...formData, provinceCode: e.target.value })}
            disabled={loadingProvinces}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            required
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Quận/Huyện <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.districtCode}
            onChange={(e) => setFormData({ ...formData, districtCode: e.target.value })}
            disabled={!formData.provinceCode || loadingDistricts}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            required
          >
            <option value="">
              {!formData.provinceCode
                ? "Vui lòng chọn tỉnh/thành phố trước"
                : loadingDistricts
                ? "Đang tải..."
                : "Chọn quận/huyện"}
            </option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Phường/Xã <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.wardCode}
            onChange={(e) => setFormData({ ...formData, wardCode: e.target.value })}
            disabled={!formData.districtCode || loadingWards}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            required
          >
            <option value="">
              {!formData.districtCode
                ? "Vui lòng chọn quận/huyện trước"
                : loadingWards
                ? "Đang tải..."
                : "Chọn phường/xã"}
            </option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Địa chỉ chi tiết <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Số nhà, tên đường..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Nhãn địa chỉ (tùy chọn)
          </label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Nhà riêng, Công ty..."
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-11 px-5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang lưu..." : "Lưu địa chỉ"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="h-11 px-5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

