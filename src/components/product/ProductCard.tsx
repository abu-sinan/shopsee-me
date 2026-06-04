"use client";
import type React from "react";
import { useState }   from "react";
import Link            from "next/link";
import Image           from "next/image";
import { motion }      from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { cn, formatPrice }    from "@/lib/utils";
import { useWishlistStore }   from "@/store/wishlist.store";
import { useCartStore }       from "@/store/cart.store";
import type { Product }       from "@/types";

interface ProductCardProps {
  product: Product;
  index?:  number;
  variant?: "default" | "compact" | "large";
}

export function ProductCard({ product, index = 0, variant = "default" }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [adding,  setAdding]  = useState(false);

  const { toggle, has }  = useWishlistStore();
  const addItem          = useCartStore((s) => s.addItem);
  const isWishlisted     = has(product.id);

  const primary   = product.images[0];
  const secondary = product.images[1];
  const hasDisc   = product.compare_at_price && product.compare_at_price > product.price;
  const discPct   = hasDisc
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  // Quick add — use first in-stock variant
  const firstVariant = product.variants.find((v) => v.stock > 0);
  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firstVariant) return;
    setAdding(true);
    addItem(product, firstVariant, 1);
    await new Promise((r) => setTimeout(r, 1200));
    setAdding(false);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Image container */}
      <div
        className="relative product-img-wrap mb-3.5"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link
          href={`/product/${product.slug}`}
          className="block bg-brand-cream overflow-hidden"
          style={{ aspectRatio: variant === "large" ? "3/4" : "4/5" }}
          aria-label={product.name}
        >
          {/* Primary image */}
          {primary && (
            <Image
              src={primary.url}
              alt={primary.alt || product.name}
              fill
              className={cn(
                "object-cover transition-opacity duration-500",
                hovered && secondary ? "opacity-0" : "opacity-100"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
          {/* Hover image */}
          {secondary && (
            <Image
              src={secondary.url}
              alt={secondary.alt || product.name}
              fill
              className={cn(
                "object-cover transition-opacity duration-500",
                hovered ? "opacity-100" : "opacity-0"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}
        </Link>

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new && (
            <span className="bg-brand-black text-white text-[9px] font-semibold tracking-widest-3 uppercase px-2 py-0.5">
              New
            </span>
          )}
          {hasDisc && (
            <span className="bg-brand-accent text-white text-[9px] font-semibold tracking-widest-2 uppercase px-2 py-0.5">
              -{discPct}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); toggle(product.id); }}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 flex items-center justify-center",
            "bg-white/90 backdrop-blur-sm transition-all duration-200",
            "hover:bg-white hover:scale-110",
            isWishlisted ? "text-brand-black" : "text-brand-stone"
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={13}
            strokeWidth={1.5}
            className={cn(isWishlisted && "fill-brand-black")}
          />
        </button>

        {/* Quick add — desktop */}
        <motion.div
          initial={false}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-0 left-0 right-0 hidden md:block"
        >
          {firstVariant ? (
            <button
              onClick={handleQuickAdd}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "py-3 text-[0.625rem] font-semibold tracking-widest-3 uppercase",
                "transition-all duration-200",
                adding
                  ? "bg-brand-green text-white"
                  : "bg-brand-black/90 backdrop-blur-sm text-white hover:bg-brand-black"
              )}
            >
              <ShoppingBag size={11} strokeWidth={2} />
              {adding ? "Added ✓" : "Quick Add"}
            </button>
          ) : (
            <div className="w-full py-3 text-center text-[0.625rem] font-medium tracking-widest-2 uppercase bg-brand-gray-100 text-brand-stone">
              Out of Stock
            </div>
          )}
        </motion.div>
      </div>

      {/* Info */}
      <div>
        <Link
          href={`/product/${product.slug}`}
          className="block text-sm font-medium text-brand-dark leading-snug hover:text-brand-black transition-colors line-clamp-2 mb-1.5"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-brand-black">
            {formatPrice(product.price)}
          </span>
          {hasDisc && (
            <span className="text-xs text-brand-stone line-through">
              {formatPrice(product.compare_at_price!)}
            </span>
          )}
        </div>

        {/* Size chips */}
        {product.variants.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.variants.slice(0, 5).map((v) => (
              <span
                key={v.id}
                className={cn(
                  "text-[9px] px-1.5 py-0.5 font-medium tracking-wider border",
                  v.stock > 0
                    ? "border-brand-gray-200 text-brand-ash"
                    : "border-brand-gray-100 text-brand-gray-300 line-through"
                )}
              >
                {v.size}
              </span>
            ))}
            {product.variants.length > 5 && (
              <span className="text-[9px] text-brand-stone">+{product.variants.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
