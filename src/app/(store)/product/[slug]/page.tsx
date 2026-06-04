import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductDetailClient } from "@/features/product/ProductDetailClient";
import { RelatedProducts } from "@/features/product/RelatedProducts";
import type { Product } from "@/types";

interface Props { params: Promise<{ slug: string }>; }

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  if (data.images) data.images.sort((a: { position: number }, b: { position: number }) => a.position - b.position);
  return data as Product;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { title: product.name, description: product.description.slice(0, 160), images: product.images[0] ? [{ url: product.images[0].url }] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return (
    <>
      <ProductDetailClient product={product!} />
      <RelatedProducts categoryId={product!.category_id} excludeId={product!.id} />
    </>
  );
}
