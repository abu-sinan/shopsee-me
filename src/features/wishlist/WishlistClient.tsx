"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/product/ProductCard";
import { useWishlistStore } from "@/store/wishlist.store";
import { SectionHeader } from "@/components/shared/SectionHeader";
import type { Product } from "@/types";

export function WishlistClient() {
  const { productIds, toggle, _hasHydrated } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productIds.length === 0) { setProducts([]); setLoading(false); return; }
    const supabase = createClient();
    supabase.from("products").select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
      .in("id", productIds)
      .then(({ data }) => {
        const ordered = productIds.map((id) => (data ?? []).find((p: Product) => p.id === id)).filter(Boolean) as Product[];
        setProducts(ordered); setLoading(false);
      });
  }, [productIds]);

  useEffect(() => { setProducts((prev) => prev.filter((p) => productIds.includes(p.id))); }, [productIds]);

  if (!_hasHydrated || loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-brand">
          <SectionHeader eyebrow="Saved" title="My Wishlist" className="mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-brand-gray-100 mb-3" /><div className="h-4 bg-brand-gray-100 rounded w-3/4 mb-2" /><div className="h-3 bg-brand-gray-100 rounded w-1/3" /></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container-brand">
        <div className="flex items-end justify-between mb-10">
          <SectionHeader eyebrow="Saved" title="My Wishlist" subtitle={products.length > 0 ? `${products.length} saved item${products.length !== 1 ? "s" : ""}` : undefined} align="left" />
        </div>
        <AnimatePresence mode="popLayout">
          {products.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="py-24 flex flex-col items-center gap-5 text-center">
              <div className="w-20 h-20 bg-brand-gray-100 rounded-full flex items-center justify-center"><Heart size={32} strokeWidth={1} className="text-brand-gray-300" /></div>
              <div><h2 className="font-display font-semibold text-xl text-brand-black mb-2">Your wishlist is empty</h2><p className="text-sm text-brand-gray-500 max-w-xs">Save items you love by tapping the heart icon.</p></div>
              <Link href="/shop" className="btn-primary gap-2 mt-2">Explore Collection <ArrowRight size={14} strokeWidth={1.5} /></Link>
            </motion.div>
          ) : (
            <motion.div key="grid" layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-y-14">
              {products.map((product, index) => (
                <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {products.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-16 md:mt-20 bg-brand-gray-50 border border-brand-gray-200 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div><p className="label-caps mb-2">Ready to Shop?</p><h3 className="font-display font-semibold text-xl md:text-2xl text-brand-black">Add them to your bag before they sell out</h3></div>
            <div className="flex items-center gap-3 shrink-0"><Link href="/shop" className="btn-outline gap-2"><ShoppingBag size={14} strokeWidth={1.5} />Shop All</Link></div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
