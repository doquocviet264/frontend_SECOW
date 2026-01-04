export type OrderStatus = "placed" | "packed" | "shipping" | "completed" | "cancelled";

export type TrackingEvent = {
  id: string;
  status: string;
  date: string;
  time: string;
  description: string;
  isCurrent?: boolean;
};

export type OrderItem = {
  id: string;
  name: string;
  variant: string; // VD: Size L, Độ mới 95%
  price: number;
  originalPrice?: number;
  quantity: number;
  imageUrl: string;
  tags?: string[]; // VD: Đổi trả 15 ngày
};

export type ShopInfo = {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
};

export type OrderDetail = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  backendStatus?: string; // Backend status để kiểm tra quyền hủy đơn
  shop: ShopInfo;
  tracking: TrackingEvent[];
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
  };
  payment: {
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    method: string;
  };
  reviewInfo?: {
    canReview: boolean;
    reviewedProducts: string[];
    allReviewed: boolean;
  };
};