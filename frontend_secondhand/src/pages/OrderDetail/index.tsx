import OrderHeader from "./components/OrderHeader";
import ShippingStatus from "./components/ShippingStatus";
import OrderItems from "./components/OrderItems";
import OrderAddress from "./components/OrderAddress";
import OrderSidebar from "./components/OrderSidebar";
import type { OrderDetail } from "./types";
import PageLayout from "@/components/layout/PageLayout";
// --- MOCK DATA GIỐNG HÌNH ẢNH ---
const MOCK_ORDER: OrderDetail = {
  id: "OD123456",
  createdAt: "24 tháng 10, 2023 - 14:30",
  status: "shipping",
  shop: {
    id: "S001",
    name: "Vintage Store HN",
    avatarUrl: "https://i.pravatar.cc/150?u=vintage_store",
    rating: 4.9,
    reviewCount: 128
  },
  shippingAddress: {
    name: "Nguyễn Văn A",
    phone: "(+84) 901 234 567",
    address: "Số 123, Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
  },
  tracking: [
    {
      id: "T1",
      status: "Đơn hàng đang được vận chuyển đến bạn",
      date: "25/10/2023",
      time: "09:15",
      description: "Kho trung chuyển Quận 7",
      isCurrent: true
    },
    {
      id: "T2",
      status: "Đơn vị vận chuyển đã lấy hàng",
      date: "25/10/2023",
      time: "09:00",
      description: "Shipper đã nhận hàng từ kho"
    },
    {
      id: "T3",
      status: "Người bán đang chuẩn bị hàng",
      date: "24/10/2023",
      time: "16:00",
      description: "Shop đã đóng gói xong"
    }
  ],
  items: [
    {
      id: "P1",
      name: "Áo khoác Denim Vintage 90s - Xanh nhạt",
      variant: "Size L",
      quantity: 1,
      price: 450000,
      tags: ["Độ mới 95%"],
      imageUrl: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=200"
    },
    {
      id: "P2",
      name: "Áo khoác da Biker Jacket - Da thật",
      variant: "Size M",
      quantity: 1,
      price: 1200000,
      tags: ["Độ mới 85%"],
      imageUrl: "https://images.unsplash.com/photo-1551028919-ac7eddcb9885?auto=format&fit=crop&q=80&w=200"
    }
  ],
  payment: {
    subtotal: 1650000,
    shippingFee: 35000,
    discount: 15000,
    total: 1670000,
    method: "COD"
  }
};

export default function OrderDetailPage() {
  return (
    <PageLayout>
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <OrderHeader order={MOCK_ORDER} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content (Left - 8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <ShippingStatus tracking={MOCK_ORDER.tracking} />
            <OrderItems items={MOCK_ORDER.items} />
            <OrderAddress address={MOCK_ORDER.shippingAddress} />
          </div>

          {/* Sidebar (Right - 4 cols) */}
          <div className="lg:col-span-4">
             <div className="sticky top-6">
                <OrderSidebar order={MOCK_ORDER} />
             </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}