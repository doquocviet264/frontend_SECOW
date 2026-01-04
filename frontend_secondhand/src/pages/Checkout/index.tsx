import { useEffect, useMemo, useState } from "react";
import AddressSection from "./components/AddressSection";
import ProductsSection from "./components/ProductsSection";
import PaymentMethodSection from "./components/PaymentMethodSection";
import OrderSummary from "./components/OrderSummary";
import type { Address, PaymentMethod, SellerCheckoutGroup } from "./types";
import PageLayout from "@/components/layout/PageLayout";
import { cartService } from "@/services/cartService";
import NewAddressModal from "./components/NewAddressModal";
import { addressService } from "@/services/addressService";
import { orderService } from "@/services/orderService";
import { useCart } from "@/store/cart";


const EMPTY_SELLERS: SellerCheckoutGroup[] = [];

const sumPrices = (groups: SellerCheckoutGroup[]) =>
  groups.reduce((sum, g) => sum + g.items.reduce((s2, it) => s2 + it.price, 0), 0);

const countItems = (groups: SellerCheckoutGroup[]) =>
  groups.reduce((sum, g) => sum + g.items.length, 0);

export default function CheckoutPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [sellers, setSellers] = useState<SellerCheckoutGroup[]>(EMPTY_SELLERS);
  const [isNewAddressOpen, setIsNewAddressOpen] = useState(false);
  const { refreshCart } = useCart();

  useEffect(() => {
    const load = async () => {
      const selectedStr = sessionStorage.getItem("checkoutSelectedItemIds");
      const selectedIds: string[] = selectedStr ? JSON.parse(selectedStr) : [];

      // Load cart
      const res = await cartService.getCart();
      const items = res?.data?.cart?.items || [];
      const filtered = selectedIds.length > 0 ? items.filter((it: any) => selectedIds.includes(it.id)) : items;
      const group: SellerCheckoutGroup = {
        id: "g1",
        name: "Giỏ hàng của bạn",
        items: filtered.map((it: any) => ({
          id: it.id,
          title: it.product?.title || "Sản phẩm",
          imageUrl: it.product?.image || "",
          price: (it.product?.price || 0) * (it.quantity || 1),
          tags: [`Số lượng: ${it.quantity || 1}`],
        })),
      };
      setSellers(group.items.length > 0 ? [group] : EMPTY_SELLERS);

      // Load addresses from backend
      try {
        const addrRes = await addressService.getUserAddresses();
        const apiAddrs = addrRes?.data?.addresses || [];
        const mapped: Address[] = apiAddrs.map((a: any) => ({
          id: a._id,
          fullName: a.receiver,
          phone: a.phone,
          addressLine: [a.street, a.ward, a.district, a.city].filter(Boolean).join(", "),
          city: a.city,
          district: a.district,
          ward: a.ward,
          label: a.label,
          isDefault: a.isDefault,
        }));
        setAddresses(mapped);
        const def = apiAddrs.find((a: any) => a.isDefault);
        setSelectedAddressId(def?._id || mapped[0]?.id || "");
      } catch {}
    };
    load();
  }, []);

  const itemCount = useMemo(() => countItems(sellers), [sellers]);
  const subtotal = useMemo(() => sumPrices(sellers), [sellers]);
  const shippingFee = 45000;
  const shippingDiscount = 15000;

  const handlePlaceOrder = async () => {
    const addr = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
    if (!addr) {
      alert("Vui lòng thêm địa chỉ giao hàng.");
      return;
    }
    const paymentMethod =
      payment === "cod" ? "cod" : payment === "bank" ? "bank_transfer" : "vnpay";
    try {
      const res = await orderService.createOrder({
        shippingAddress: {
          fullName: addr.fullName,
          phone: addr.phone,
          address: addr.addressLine,
          city: addr.city || "",
          district: addr.district,
          ward: addr.ward,
        },
        paymentMethod,
      });
      const orderId = res?.data?.order?._id;
      await refreshCart();
      if (orderId) {
        window.location.href = `/order/${orderId}`;
      }
    } catch (e) {
      alert("Tạo đơn hàng thất bại. Vui lòng thử lại.");
    }
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
              addresses={addresses}
              selectedId={selectedAddressId}
              onSelect={setSelectedAddressId}
              onAddNew={() => setIsNewAddressOpen(true)}
            />

            <ProductsSection sellers={sellers} />

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

        <NewAddressModal
          isOpen={isNewAddressOpen}
          onClose={() => setIsNewAddressOpen(false)}
          onCreate={(addr) => {
            setAddresses((prev) => {
              const shouldBeDefault = prev.length === 0 || addr.isDefault;
              const next = shouldBeDefault
                ? [{ ...addr, isDefault: true }, ...prev.map((a) => ({ ...a, isDefault: false }))]
                : [addr, ...prev];
              return next;
            });
            setSelectedAddressId(addr.id);
          }}
        />
      </main>
    </PageLayout>
  );
}
