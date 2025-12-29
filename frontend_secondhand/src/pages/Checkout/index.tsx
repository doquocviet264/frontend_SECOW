import { useMemo, useState } from "react";
import AddressSection from "./components/AddressSection";
import ProductsSection from "./components/ProductsSection";
import PaymentMethodSection from "./components/PaymentMethodSection";
import OrderSummary from "./components/OrderSummary";
import type { Address, PaymentMethod, SellerCheckoutGroup } from "./types";
import PageLayout from "@/components/layout/PageLayout";
const MOCK_ADDRESSES: Address[] = [
  {
    id: "a1",
    fullName: "Nguyễn Văn A",
    phone: "0901234567",
    isDefault: true,
    addressLine: "123 Đường ABC, Phường Lý Thái Tổ, Quận Hoàn Kiếm, Hà Nội",
  },
  {
    id: "a2",
    fullName: "Nguyễn Văn A",
    phone: "0901234567",
    label: "Văn phòng",
    addressLine: "Tòa nhà Keangnam, Phạm Hùng, Nam Từ Liêm, Hà Nội",
  },
];

const MOCK_SELLERS: SellerCheckoutGroup[] = [
  {
    id: "s1",
    name: "Vintage House HN",
    canChat: true,
    items: [
      {
        id: "p1",
        title: "Áo khoác Denim Vintage Nhật Bản size L",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDLG_kwBdX61QO5PuvqRnm5H_5zgZidjrTS_PlGWYFlr6nR0Z2-6GvRAr3XoTI0RA6yCn-4TQWe7cILs9-2bnKe1Bez_ZzmH-odWjnAuaEpQdFXU3xiNqMh1CfQ5qOhtCo9WEe2j_KAJ-UwNi8_TKUSjju7gbrJ2ekTQT_xgmlqwuD6Hgl8FZXBbpPc-lQ_lvvJ7DK9_n5rysccaIgmwAF5qdfq-ecaa1T9bc35o_8N4MuePNN5Od9elYioKZGXsTsNZVxLlmxnnyt2",
        price: 450000,
        oldPrice: 500000,
        tags: ["Size: L", "Độ mới 95%"],
        shippingLabel: "Đơn vị vận chuyển: Nhanh",
      },
    ],
  },
  {
    id: "s2",
    name: "Camera Cũ Giá Rẻ",
    items: [
      {
        id: "p2",
        title: "Máy ảnh Film Canon AE-1 Program + Lens 50mm",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAkXBBXi5cIhibT7MN4bGIXgAbMPz5piZWOF1RUdyXTK5ipYluUB68r258rwmgliysvEQkkKUAGeYgRer3-iTOxkEk27x-DMoYq8z1IgLWhV6t0sZWqIf-wnkKF2wCLAdhyGMBCRyiN9tO7SvWuMgguPE1siuO1emTIIkNLlIh_lPcHtl3f79j7DbTBX5JVo4mSWtlCP0FRqVWE3MLO172rmlRXOD0C2heLfjkc5jrZIPOFxNEAzmEgiR2h3iaXEnsXqjtU9xVUofTL",
        price: 2500000,
        tags: ["Màu: Bạc", "Độ mới 85%"],
      },
    ],
  },
];

const sumPrices = (groups: SellerCheckoutGroup[]) =>
  groups.reduce((sum, g) => sum + g.items.reduce((s2, it) => s2 + it.price, 0), 0);

const countItems = (groups: SellerCheckoutGroup[]) =>
  groups.reduce((sum, g) => sum + g.items.length, 0);

export default function CheckoutPage() {
  const [selectedAddressId, setSelectedAddressId] = useState<string>(MOCK_ADDRESSES[0]?.id ?? "");
  const [payment, setPayment] = useState<PaymentMethod>("cod");

  const itemCount = useMemo(() => countItems(MOCK_SELLERS), []);
  const subtotal = useMemo(() => sumPrices(MOCK_SELLERS), []);
  const shippingFee = 45000;
  const shippingDiscount = 15000;

  const handlePlaceOrder = () => {
    console.log("PLACE_ORDER", { selectedAddressId, payment });
  };

  return (
    <PageLayout>
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-black text-text-main dark:text-white tracking-tight">
                Thanh toán
            </h1>
            <p className="text-text-muted dark:text-slate-400">"Vui lòng kiểm tra kỹ thông tin đơn hàng trước khi xác nhận."</p>
            </div>
            <AddressSection
              addresses={MOCK_ADDRESSES}
              selectedId={selectedAddressId}
              onSelect={setSelectedAddressId}
              onAddNew={() => console.log("ADD_NEW_ADDRESS")}
            />

            <ProductsSection sellers={MOCK_SELLERS} />

            <PaymentMethodSection value={payment} onChange={setPayment} />
          </div>

          <div className="lg:col-span-4">
            <OrderSummary
              itemCount={itemCount}
              subtotal={subtotal}
              shippingFee={shippingFee}
              shippingDiscount={shippingDiscount}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
