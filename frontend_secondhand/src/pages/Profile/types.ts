export type ProfileTabKey = "overview" | "personal" | "address" | "orders";

export type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  joinedYear: number;
  avatarUrl?: string;
  verified?: boolean;
  dateOfBirth?: string; // Format: YYYY-MM-DD for date input
};

export type Address = {
  id: string;
  label?: string;
  receiver: string;
  phone: string;
  addressLine: string;
  street?: string;
  city?: string;
  district?: string;
  ward?: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  isDefault?: boolean;
};

export type OrderStatus = "processing" | "shipping" | "completed" | "cancelled";

export type Order = {
  id: string;
  _id: string; // MongoDB _id để điều hướng đến trang chi tiết
  createdAt: string;
  status: OrderStatus;
  itemCount: number;
  total: number;
};

export type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  amount?: number;
  badgeText: string;
  badgeTone: "green" | "blue" | "yellow" | "gray";
  imageUrl?: string;
};
