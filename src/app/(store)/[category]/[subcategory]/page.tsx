import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShopPageClient } from "@/features/shop/ShopPageClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ category: string; subcategory: string }>;
}

const VALID_CATEGORIES = ["men", "women", "kids", "accessories"];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, subcategory } = await params;
  const cat = category.charAt(0).toUpperCase() + category.slice(1);
  const sub = subcategory.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return {
    title: `${sub} — ${cat}`,
    description: `Shop ${sub} from ${cat}'s collection at ShopSeeMe.`,
  };
}

export default async function SubcategoryPage({ params }: Props) {
  const { category, subcategory } = await params;
  if (!VALID_CATEGORIES.includes(category)) notFound();
  return (
    <Suspense>
      <ShopPageClient categorySlug={category} subcategorySlug={subcategory} />
    </Suspense>
  );
}
