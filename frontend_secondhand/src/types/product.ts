export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  attributes: {
    name: string;
    value: string;
  }[];

  originalPrice: number;
  condition: "Like New" | "Good" | "Fair" | "Old";
  location: {
    city: string;
    district: string;
    detail: string;
  };
  size: string | number;
  brand: string;
  category: {
    _id: string;
    name: string;
  };
  seller: {
    _id: string;
    storeName: string;
    logo: string;
  };
  images: string[];
  video: string;
  status: "pending" | "active" | "hidden" | "violation" | "sold";
  stock: number;
  violationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  image: string;
  isActive: boolean;
  parentId?: string;
  productCount?: number;
  children?: Category[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
