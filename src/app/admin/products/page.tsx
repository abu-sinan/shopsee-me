import type { Metadata }          from "next";
import { Suspense }               from "react";
import { createClient }           from "@/lib/supabase/server";
import { AdminProductsClient }    from "@/features/admin/products/AdminProductsClient";
import type { Product }           from "@/types";

export const metadata: Metadata = { title: "Products" };

async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .order("created_at", { ascending: false });
  return (data ?? []) as Product[];
}

export default async function AdminProductsPage() {
  const products = await getProducts();
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-brand-gray-200 animate-pulse">
            <div className="aspect-[4/3] bg-brand-gray-100" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-brand-gray-100 rounded w-3/4" />
              <div className="h-3 bg-brand-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    }>
      <AdminProductsClient initialProducts={products} />
    </Suspense>
  );
}
