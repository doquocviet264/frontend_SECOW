export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type ProductConditionLabel = "Như mới" | "Tốt" | "Khá" | "Cũ";

export type Seller = {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  totalReviews: number;
  responseRate: number;
  joinedYears: number;
  isOnline?: boolean;
};

export type ProductDetail = {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  conditionLabel: ProductConditionLabel;
  isApproved: boolean;
  location: string;
  postedAgo: string;
  images: string[];
  defects: string[];
  description: string[];
  specs: { label: string; value: string }[];
  returnPolicy: string[];
  seller: Seller;
  storeId?: string | null;
};

export type Review = {
  id: string;
  name: string;
  timeAgo: string;
  rating: number;
  content: string;
  images?: string[];
};
