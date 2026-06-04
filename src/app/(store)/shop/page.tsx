import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopPageClient } from "@/features/shop/ShopPageClient";
import { SITE_CONFIG } from "@/constants";

export const metadata: Metadata = {
  title: "Shop All",
  description: `Browse the full ${SITE_CONFIG.name} collection.`,
};

export default function ShopPage() {
  return <Suspense><ShopPageClient /></Suspense>;
}
