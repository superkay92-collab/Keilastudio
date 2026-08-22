export interface LengthOption {
  inches: number;
  fallsAt?: string;
  price: number; // GHS
}

export interface Product {
  id: string;
  name: string;
  category: "wigs" | "bundles" | "extensions" | "closures-frontals" | "nails" | "hair-care";
  price: number; // in GHS — base/fallback price, also used when `lengths` is absent
  images: string[];
  description: string;
  specs: {
    length: string;
    texture: string;
  };
  availableLengths: string[];
  lengths?: LengthOption[]; // when set, product detail uses per-length pricing
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedLength: string;
  unitPrice?: number; // resolved from LengthOption at add-to-cart time
}

export interface ShippingAddress {
  street: string;
  city: string;
  region: string;
  country: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: "GHS" | "USD";
  status: "pending" | "processing" | "shipped" | "delivered";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  paymentMethod: "paystack" | "flutterwave" | "momo";
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

export type Currency = "GHS" | "USD";
export type Category = "all" | "wigs" | "bundles" | "extensions" | "closures-frontals" | "nails" | "hair-care";
