import type { NavItem } from "@/types";

export const SITE_CONFIG = {
  name: "ShopSeeMe",
  tagline: "Modern Fashion For Everyday Confidence",
  description: "Premium Bangladeshi fashion brand. Minimal, elegant, and made for you.",
  url: "https://shopsee.me",
  ogImage: "/og-image.jpg",
  currency: "BDT",
  phone: "+880 1700 000000",
  email: "hello@shopsee.me",
  address: "Dhaka, Bangladesh",
  social: {
    instagram: "https://instagram.com/shopsee.me",
    facebook: "https://facebook.com/shopsee.me",
  },
} as const;

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Men", href: "/men",
    children: [
      { label: "T-Shirts", href: "/men/t-shirts" },
      { label: "Shirts", href: "/men/shirts" },
      { label: "Hoodies", href: "/men/hoodies" },
      { label: "All Men", href: "/men" },
    ],
  },
  {
    label: "Women", href: "/women",
    children: [
      { label: "Dresses", href: "/women/dresses" },
      { label: "Tops", href: "/women/tops" },
      { label: "Hoodies", href: "/women/hoodies" },
      { label: "All Women", href: "/women" },
    ],
  },
  {
    label: "Kids", href: "/kids",
    children: [
      { label: "Boys", href: "/kids/boys" },
      { label: "Girls", href: "/kids/girls" },
      { label: "All Kids", href: "/kids" },
    ],
  },
  {
    label: "Accessories", href: "/accessories",
    children: [
      { label: "Bags", href: "/accessories/bags" },
      { label: "Shoes", href: "/accessories/shoes" },
      { label: "All", href: "/accessories" },
    ],
  },
  { label: "Sale", href: "/sale" },
];

export const DELIVERY_AREAS = [
  "Dhaka City",
  "Chattogram City",
  "Sylhet City",
  "Rajshahi City",
  "Khulna City",
  "Barishal City",
  "Outside City / District",
] as const;

export const SHIPPING_FEES: Record<string, number> = {
  "Dhaka City": 60,
  "Chattogram City": 100,
  "Sylhet City": 100,
  "Rajshahi City": 100,
  "Khulna City": 100,
  "Barishal City": 100,
  "Outside City / District": 130,
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
