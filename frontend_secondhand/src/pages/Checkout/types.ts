export type Address = {
  id: string;
  fullName: string;
  phone: string;
  label?: string;
  isDefault?: boolean;
  addressLine: string;
  city?: string;
  district?: string;
  ward?: string;
};

export type CheckoutItem = {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  oldPrice?: number;
  tags?: string[];
  shippingLabel?: string;
};

export type SellerCheckoutGroup = {
  id: string;
  name: string;
  canChat?: boolean;
  items: CheckoutItem[];
};

export type PaymentMethod = "cod" | "bank" | "wallet";
