export type ShopStats = {
  rating: number;
  reviewCount: number;
  soldCount: number;
  responseRate: number;
  responseTime: string;
  joinedDate: string;
  followerCount: number;
};

export type ShopProfile = {
  id: string;
  name: string;
  avatarUrl: string;
  location: string;
  isTrusted: boolean; // Badge "UY TÍN"
  stats: ShopStats;
  bannerUrl: string;
  description: string;
};

export type ProductItem = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  badge?: string; // VD: 95% NEW, AUTH
  condition: string; // VD: Size 42, Size L
  postedTime: string; // VD: 2 giờ trước
  status?: "available" | "sold";
};