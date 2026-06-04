import type { Metadata } from "next";
import { Suspense }       from "react";
import { ShopPageClient } from "@/features/shop/ShopPageClient";

export const metadata: Metadata = {
  title:       "New Arrivals",
  description: "Shop the latest new arrivals at ShopSeeMe.",
};

export default function NewArrivalsPage() {
  return <Suspense><ShopPageClient categorySlug="new" /></Suspense>;
}
