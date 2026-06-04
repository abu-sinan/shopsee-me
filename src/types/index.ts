export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  created_at: string;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  position: number;
};

export type ProductVariant = {
  id: string;
  size: string;
  color: string | null;
  stock: number;
  sku: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category_id: string;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  is_featured: boolean;
  is_new: boolean;
  created_at: string;
};

export type CartItem = {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  user_id: string | null;
  order_number: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  payment_method: "cod";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  variant_id: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type ShippingAddress = {
  line1: string;
  area: string;
  city: string;
  notes?: string;
};

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "customer" | "admin";
  created_at: string;
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export type SortOption = "newest" | "price-asc" | "price-desc" | "popular";

export type FilterState = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  sort: SortOption;
};
