export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_authorized: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  model: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  msrp: number | null;
  msrp_source: string | null;
  price_updated_at: string | null;
  brand_id: string;
  brand?: Brand;
  category_id: string | null;
  images: string[];
  stock: number;
  is_featured: boolean;
  is_deal: boolean;
  created_at: string;
};

export type ListingCondition = "like_new" | "excellent" | "good" | "fair";

export type Listing = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  brand_id: string | null;
  brand?: Brand;
  images: string[];
  condition: ListingCondition;
  is_sold: boolean;
  is_approved: boolean;
  created_at: string;
};

export type CartItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string | null;
  type: "product" | "listing";
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string | null;
  status: OrderStatus;
  total: number;
  items: CartItem[];
  shipping_address: ShippingAddress | null;
  created_at: string;
};

export type ShippingAddress = {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type UserRole = "user" | "seller" | "admin" | "super_admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_verified_seller: boolean;
  created_at: string;
};
