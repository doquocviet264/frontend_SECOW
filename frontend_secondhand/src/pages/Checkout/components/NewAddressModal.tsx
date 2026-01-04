import type { Address } from "../types";
import { useEffect, useState } from "react";
import { addressService, type Province, type District, type Ward } from "@/services/addressService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (addr: Address) => void;
};

export default function NewAddressModal({ isOpen, onClose, onCreate }: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [provinceCode, setProvinceCode] = useState<string>("");
  const [districtCode, setDistrictCode] = useState<string>("");
  const [wardCode, setWardCode] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [label, setLabel] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    addressService.getProvinces().then(setProvinces).catch(() => setProvinces([]));
  }, [isOpen]);

  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setDistrictCode("");
      setWards([]);
      setWardCode("");
      return;
    }
    addressService.getDistrictsByProvince(provinceCode).then(setDistricts).catch(() => setDistricts([]));
    setDistrictCode("");
    setWards([]);
    setWardCode("");
  }, [provinceCode]);

  useEffect(() => {
    if (!districtCode) {
      setWards([]);
      setWardCode("");
      return;
    }
    addressService.getWardsByDistrict(districtCode).then(setWards).catch(() => setWards([]));
    setWardCode("");
  }, [districtCode]);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const provinceName = provinces.find((p) => String(p.code) === String(provinceCode))?.name || "";
    const districtName = districts.find((d) => String(d.code) === String(districtCode))?.name || "";
    const wardName = wards.find((w) => String(w.code) === String(wardCode))?.name || "";
    const payload = {
      receiver: fullName.trim() || "Người nhận",
      phone: phone.trim(),
      street: detail.trim(),
      city: provinceName,
      district: districtName,
      ward: wardName,
      provinceCode,
      districtCode,
      wardCode,
      label: label.trim() || undefined,
      isDefault,
    };
    const res = await addressService.addUserAddress(payload);
    const adr = res?.data?.address;
    if (adr) {
      onCreate({
        id: adr._id,
        fullName: adr.receiver,
        phone: adr.phone,
        addressLine: [adr.street, adr.ward, adr.district, adr.city].filter(Boolean).join(", "),
        city: adr.city,
        district: adr.district,
        ward: adr.ward,
        label: adr.label,
        isDefault: adr.isDefault,
      });
    }
    setFullName("");
    setPhone("");
    setProvinceCode("");
    setDistrictCode("");
    setWardCode("");
    setDetail("");
    setLabel("");
    setIsDefault(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[var(--surface-dark)] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Thêm địa chỉ mới</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Họ tên</label>
              <input
                className="w-full h-10 px-3 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Số điện thoại</label>
              <input
                className="w-full h-10 px-3 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm mb-1">Tỉnh/Thành phố</label>
              <select
                className="w-full h-10 px-3 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none"
                value={provinceCode}
                onChange={(e) => setProvinceCode(e.target.value)}
                required
              >
                <option value="">Chọn tỉnh/thành</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Quận/Huyện</label>
              <select
                className="w-full h-10 px-3 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none"
                value={districtCode}
                onChange={(e) => setDistrictCode(e.target.value)}
                required
                disabled={!provinceCode}
              >
                <option value="">Chọn quận/huyện</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Phường/Xã</label>
              <select
                className="w-full h-10 px-3 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none"
                value={wardCode}
                onChange={(e) => setWardCode(e.target.value)}
                required
                disabled={!districtCode}
              >
                <option value="">Chọn phường/xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Địa chỉ chi tiết</label>
            <input
              className="w-full h-10 px-3 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Nhãn (Nhà, Văn phòng ...)</label>
            <input
              className="w-full h-10 px-3 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:outline-none"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <span className="text-sm">Đặt làm địa chỉ mặc định</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded border border-gray-200 dark:border-white/10"
            >
              Hủy
            </button>
            <button type="submit" className="h-10 px-4 rounded bg-primary text-black font-bold">
              Lưu địa chỉ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


