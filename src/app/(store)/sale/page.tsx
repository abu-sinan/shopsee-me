import type { Metadata } from "next";
import { Suspense }       from "react";
import { ShopPageClient } from "@/features/shop/ShopPageClient";

export const metadata: Metadata = {
  title:       "Sale",
  description: "Shop discounted items at ShopSeeMe.",
};

export default function SalePage() {
  return <Suspense><ShopPageClient categorySlug="sale" /></Suspense>;
}
