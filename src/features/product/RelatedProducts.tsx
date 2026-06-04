import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import type { Product } from "@/types";

export async function RelatedProducts({ categoryId, excludeId }: { categoryId: string; excludeId: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .limit(4);
  const products = (error || !data) ? [] : data as Product[];
  if (products.length === 0) return null;
  return (
    <section className="py-16 md:py-24 border-t border-brand-gray-100" aria-label="Related products">
      <div className="container-brand">
        <SectionHeader eyebrow="You may also like" title="Complete the Look" className="mb-10 md:mb-14" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
          {products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
        </div>
      </div>
    </section>
  );
}
