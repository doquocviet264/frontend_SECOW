export type CartItem = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  oldPrice?: number;
  badges?: string[];
  conditionTag?: { label: string; tone: "green" | "yellow" | "red" };
  color?: string;
  size?: string;
  stock: number;
  quantity: number;
  checked: boolean;
};

export type SellerCartGroup = {
  id: string;
  name: string;
  verified?: boolean;
  checked: boolean;
  items: CartItem[];
};

export type RecommendationItem = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  oldPrice?: number;
};
