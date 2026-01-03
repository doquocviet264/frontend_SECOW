import { useState } from "react";
import type { Address } from "../types";
import AddressForm from "./AddressForm";
import { userService } from "@/services/userService";

type Props = {
  addresses: Address[];
  onAddressAdded?: () => void;
};

export default function AddressesTab({ addresses, onAddressAdded }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddClick = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditClick = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAddress(null);
    if (onAddressAdded) {
      onAddressAdded();
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      return;
    }

    try {
      setDeletingId(addressId);
      await userService.deleteAddress(addressId);
      if (onAddressAdded) {
        onAddressAdded();
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Có lỗi xảy ra khi xóa địa chỉ");
      console.error("Error deleting address:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await userService.setDefaultAddress(addressId);
      if (onAddressAdded) {
        onAddressAdded();
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Có lỗi xảy ra khi đặt địa chỉ mặc định");
      console.error("Error setting default address:", err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sổ địa chỉ</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý địa chỉ nhận hàng của bạn
          </p>
        </div>
        {!showForm && (
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Thêm địa chỉ mới
          </button>
        )}
      </div>

      {showForm ? (
        <div className="mb-6">
          <AddressForm
            initialData={
              editingAddress
                ? {
                    addressId: editingAddress.id,
                    receiver: editingAddress.receiver,
                    phone: editingAddress.phone,
                    street: editingAddress.street,
                    provinceCode: editingAddress.provinceCode,
                    districtCode: editingAddress.districtCode,
                    wardCode: editingAddress.wardCode,
                    label: editingAddress.label,
                    isDefault: editingAddress.isDefault,
                  }
                : undefined
            }
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      ) : null}

      <div className="grid gap-4">
        {addresses.map((a) => (
          <div
            key={a.id}
            className={`
              group relative p-5 rounded-2xl border transition-all duration-200
              ${a.isDefault 
                ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800" 
                : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
              }
            `}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="font-bold text-gray-900 dark:text-white text-base">
                    {a.receiver}
                  </span>
                  <span className="hidden sm:block text-gray-300 dark:text-gray-600">|</span>
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                    {a.phone}
                  </span>

                  {a.isDefault && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 uppercase tracking-wide border border-blue-200 dark:border-blue-500/30">
                      Mặc định
                    </span>
                  )}

                  {a.label && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 uppercase tracking-wide border border-gray-200 dark:border-gray-600">
                      {a.label}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                  {a.addressLine}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:self-start mt-2 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleEditClick(a)}
                  className="h-9 px-4 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Sửa
                </button>
                {!a.isDefault && (
                  <button
                    onClick={() => handleSetDefault(a.id)}
                    className="h-9 px-4 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Đặt mặc định
                  </button>
                )}
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deletingId === a.id}
                  className="h-9 px-4 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {deletingId === a.id ? "Đang xóa..." : "Xoá"}
                </button>
              </div>
            </div>
            
            {a.isDefault && (
              <div className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse opacity-50 sm:hidden"></div>
            )}
          </div>
        ))}
        
        {addresses.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">location_off</span>
            <p className="text-gray-500 dark:text-gray-400">Bạn chưa lưu địa chỉ nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}