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

export const NAV_ITEMS = [
  { label: "Shop",  href: "/shop",  children: [] },
  { label: "New",   href: "/new",   children: [] },
  { label: "Sale",  href: "/sale",  children: [] },
  { label: "About", href: "/about", children: [] },
] as const;


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
