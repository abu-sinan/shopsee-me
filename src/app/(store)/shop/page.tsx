import type { Metadata } from "next";
import { Suspense }       from "react";
import { ShopPageClient } from "@/features/shop/ShopPageClient";

export const metadata: Metadata = {
  title:       "Shop All",
  description: "Browse all products at ShopSeeMe.",
};
export const dynamic = "force-dynamic";

export default function ShopPage() {
  return <Suspense><ShopPageClient /></Suspense>;
}
