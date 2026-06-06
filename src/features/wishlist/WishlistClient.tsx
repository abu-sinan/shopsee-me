"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import Link   from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { createClient }        from "@/lib/supabase/client";
import { ProductCard }         from "@/components/product/ProductCard";
import { useWishlistStore }    from "@/store/wishlist.store";

export function WishlistClient() {
  const { productIds, toggle } = useWishlistStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [mounted, setMounted]   = useState(false);

  // Wait for client mount to avoid SSR mismatch
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;

    // Small delay to let Zustand rehydrate from localStorage
    const timer = setTimeout(async () => {
      const ids = useWishlistStore.getState().productIds;
      if (ids.length === 0) { setLoading(false); return; }

      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
        .in("id", ids);

      if (data && data.length > 0) {
        // Preserve wishlist order
        const ordered = ids
          .map((id) => data.find((p) => p.id === id))
          .filter(Boolean);
        setProducts(ordered);
      }
      setLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [mounted]);

  // Remove product when un-wishlisted
  useEffect(() => {
    if (!mounted) return;
    setProducts((prev) => prev.filter((p) => productIds.includes(p.id)));
  }, [productIds, mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-brand-stone" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 md:py-16">
      <div className="container-brand">
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <p className="label-sm mb-3">Saved Items</p>
            <h1 className="font-display font-light text-brand-black"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)", letterSpacing: "-0.02em" }}>
              My Wishlist
              {products.length > 0 && (
                <span className="ml-3 text-brand-stone font-sans text-lg font-light">
                  ({products.length})
                </span>
              )}
            </h1>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {products.length === 0 ? (
            <motion.div key="empty"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="py-24 flex flex-col items-center gap-5 text-center">
              <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center">
                <Heart size={32} strokeWidth={1} className="text-brand-stone" />
              </div>
              <div>
                <h2 className="font-display font-light text-2xl text-brand-dark mb-2"
                  style={{ letterSpacing: "-0.02em" }}>
                  Your wishlist is empty
                </h2>
                <p className="text-sm text-brand-stone max-w-xs">
                  Tap the ♡ heart on any product to save it here.
                </p>
              </div>
              <Link href="/shop" className="btn-primary gap-2 mt-2">
                Explore Collection <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
            </motion.div>
          ) : (
            <motion.div key="grid" layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-8 md:gap-y-12">
              {products.map((product, index) => (
                <motion.div key={product.id} layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {products.length > 0 && (
          <div className="mt-14 p-8 md:p-12 bg-brand-cream/50 border border-brand-warm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <p className="label-sm mb-2">Ready to buy?</p>
              <h3 className="font-display font-light text-xl md:text-2xl text-brand-black"
                style={{ letterSpacing: "-0.02em" }}>
                Add them to your bag before they sell out
              </h3>
            </div>
            <Link href="/shop" className="btn-outline gap-2 shrink-0">
              <ShoppingBag size={14} strokeWidth={1.5} />Shop All
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
