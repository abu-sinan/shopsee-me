import Link        from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types";

async function getNewArrivals(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
    .eq("is_new", true)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error || !data) return [];
  return data as Product[];
}

export async function NewArrivalsSection() {
  const products = await getNewArrivals();

  return (
    <section className="section-lg bg-brand-cream/40" aria-labelledby="new-heading">
      <div className="container-brand">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <p className="label-sm mb-3">Just Arrived</p>
            <h2 id="new-heading" className="text-display-md text-brand-black">New Arrivals</h2>
          </div>
          <Link
            href="/new"
            className="hidden sm:flex items-center gap-2 label-md text-brand-ash hover:text-brand-black transition-colors group"
          >
            View All
            <ArrowRight size={13} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-brand-warm" style={{ aspectRatio: "4/5" }} />
                <div className="h-4 bg-brand-warm rounded mt-3 w-3/4" />
                <div className="h-3 bg-brand-warm rounded mt-2 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-y-14">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Link href="/new" className="btn-outline btn-sm inline-flex">
            View All New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}
