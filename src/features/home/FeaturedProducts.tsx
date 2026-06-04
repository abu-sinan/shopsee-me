import Link          from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types";

async function getFeatured(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(4);
  if (error || !data) return [];
  return data as Product[];
}

export async function FeaturedProducts() {
  const products = await getFeatured();
  if (products.length === 0) return null;

  return (
    <section className="section-lg bg-brand-white" aria-labelledby="featured-heading">
      <div className="container-brand">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <p className="label-sm mb-3">Curated Selection</p>
            <h2 id="featured-heading" className="text-display-md text-brand-black">
              Editor&rsquo;s Choice
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-2 label-md text-brand-ash hover:text-brand-black transition-colors group"
          >
            Shop All
            <ArrowRight size={13} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-y-14">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} variant="large" />
          ))}
        </div>
      </div>
    </section>
  );
}
