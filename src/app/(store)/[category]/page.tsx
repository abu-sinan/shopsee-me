import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShopPageClient } from "@/features/shop/ShopPageClient";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = ["men", "women", "kids", "accessories", "new", "sale"];

interface Props { params: Promise<{ category: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return { title: `${label}'s Collection`, description: `Shop the latest ${label.toLowerCase()} fashion at ShopSeeMe.` };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category)) notFound();
  return <Suspense><ShopPageClient categorySlug={category} /></Suspense>;
}

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((c) => ({ category: c }));
}
