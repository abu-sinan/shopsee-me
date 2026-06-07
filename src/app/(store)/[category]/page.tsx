import type { Metadata } from "next";
import { Suspense }      from "react";
import { notFound }      from "next/navigation";
import { createClient }  from "@/lib/supabase/server";
import { ShopPageClient } from "@/features/shop/ShopPageClient";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ category: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const slug = category.toLowerCase();

  // Try to get the category name from DB
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("name")
      .eq("slug", slug)
      .single();
    if (data) return { title: data.name, description: `Shop ${data.name} at ShopSeeMe` };
  } catch { /* ignore */ }

  const name = slug.charAt(0).toUpperCase() + slug.slice(1);
  return { title: name, description: `Shop ${name} at ShopSeeMe` };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const slug = category.toLowerCase();

  // Validate slug exists in DB or is a special page
  const SPECIAL = ["new", "sale", "shop"];
  if (!SPECIAL.includes(slug)) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .single();
      if (!data) notFound();
    } catch { notFound(); }
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-cream/20 animate-pulse" />}>
      <ShopPageClient categorySlug={slug} />
    </Suspense>
  );
}
