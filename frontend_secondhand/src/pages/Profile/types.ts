export type ProfileTabKey = "overview" | "personal" | "address" | "orders";

export type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  joinedYear: number;
  avatarUrl?: string;
  verified?: boolean;
};

export type Address = {
  id: string;
  label?: string;
  receiver: string;
  phone: string;
  addressLine: string;
  isDefault?: boolean;
};

export type OrderStatus = "processing" | "shipping" | "completed" | "cancelled";

export type Order = {
  id: string;
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
