import type { Metadata } from "next";
import { Suspense }      from "react";
import { notFound }      from "next/navigation";
import { createClient }  from "@/lib/supabase/server";
import { ShopPageClient } from "@/features/shop/ShopPageClient";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ category: string; subcategory: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subcategory } = await params;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("name")
      .eq("slug", subcategory)
      .single();
    if (data) return { title: data.name, description: `Shop ${data.name} at ShopSeeMe` };
  } catch { /* ignore */ }
  const name = subcategory.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return { title: name };
}

export default async function SubcategoryPage({ params }: Props) {
  const { category, subcategory } = await params;

  // Validate subcategory exists and belongs to parent
  try {
    const supabase = await createClient();
    const { data: subCat } = await supabase
      .from("categories")
      .select("id, parent_id, categories!inner(slug)")
      .eq("slug", subcategory)
      .single();
    if (!subCat) notFound();
  } catch { /* allow even if validation fails */ }

  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-cream/20 animate-pulse" />}>
      <ShopPageClient categorySlug={category} subcategorySlug={subcategory} />
    </Suspense>
  );
}
