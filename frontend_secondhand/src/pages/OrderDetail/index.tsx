import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import OrderHeader from "./components/OrderHeader";
import ShippingStatus from "./components/ShippingStatus";
import OrderItems from "./components/OrderItems";
import OrderAddress from "./components/OrderAddress";
import OrderSidebar from "./components/OrderSidebar";
import type { OrderDetail, OrderItem, TrackingEvent } from "./types";
import PageLayout from "@/components/layout/PageLayout";
import { orderService } from "@/services/orderService";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const res = await orderService.getOrderById(id);
        const o = res?.data?.order as any;
        if (!o) return;
        const items: OrderItem[] = (o.items || []).map((it: any) => ({
          id: String(it._id),
          name: it.productName || it.product?.title || "Sản phẩm",
          variant: "",
          price: it.price || 0,
          quantity: it.quantity || 1,
          imageUrl: it.productImage || it.product?.images?.[0] || "",
          tags: [],
        }));
        const track: TrackingEvent[] = [
          {
            id: "created",
            status: "Đặt hàng thành công",
            date: new Date(o.createdAt).toLocaleDateString("vi-VN"),
            time: new Date(o.createdAt).toLocaleTimeString("vi-VN"),
            description: "",
            isCurrent: true,
          },
        ];
        const ui: OrderDetail = {
          id: String(o._id),
          createdAt: new Date(o.createdAt).toLocaleString("vi-VN"),
          status: o.status === "shipped" ? "shipping" : o.status === "delivered" ? "completed" : "placed",
          shop: {
            id: String(o.seller?._id || ""),
            name: o.seller?.name || "Người bán",
            avatarUrl: "",
            rating: 5,
            reviewCount: 0,
          },
          items,
          shippingAddress: {
            name: o.shippingAddress?.fullName || "",
            phone: o.shippingAddress?.phone || "",
            address: [o.shippingAddress?.address, o.shippingAddress?.ward, o.shippingAddress?.district, o.shippingAddress?.city].filter(Boolean).join(", "),
          },
          tracking: track,
          payment: {
            subtotal: o.totalAmount || 0,
            shippingFee: 0,
            discount: 0,
            total: o.totalAmount || 0,
            method: o.paymentMethod?.toUpperCase() || "COD",
          },
        };
        setOrder(ui);
      } catch {}
    };
    load();
  }, [id]);

  if (!order) {
    return (
      <PageLayout>
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrderHeader order={order} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <ShippingStatus tracking={order.tracking} />
            <OrderItems items={order.items} />
            <OrderAddress address={order.shippingAddress} />
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-6">
              <OrderSidebar order={order} />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}