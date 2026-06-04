"use client";

import { useState }  from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Share2, MessageCircle,
  ChevronDown, ShieldCheck, RefreshCw, Truck, Info,
} from "lucide-react";
import { cn, formatPrice }       from "@/lib/utils";
import { useCartStore }          from "@/store/cart.store";
import { useWishlistStore }      from "@/store/wishlist.store";
import { useChatStore }          from "@/store/chat.store";
import { ProductGallery }        from "@/features/product/ProductGallery";
import type { Product }          from "@/types";

const SIZE_GUIDE = [
  { size: "XS", chest: "84–88", waist: "68–72", hip: "90–94"   },
  { size: "S",  chest: "88–92", waist: "72–76", hip: "94–98"   },
  { size: "M",  chest: "92–96", waist: "76–80", hip: "98–102"  },
  { size: "L",  chest: "96–100",waist: "80–84", hip: "102–106" },
  { size: "XL", chest: "100–104",waist:"84–88", hip: "106–110" },
  { size: "XXL",chest: "104–110",waist:"88–94", hip: "110–116" },
];

const TRUST = [
  { icon: Truck,       label: "Free Delivery",  sub: "Orders over ৳1,500"  },
  { icon: RefreshCw,   label: "Easy Returns",   sub: "Within 7 days"       },
  { icon: ShieldCheck, label: "100% Authentic", sub: "Genuine products"    },
];

export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity]         = useState(1);
  const [sizeError, setSizeError]       = useState(false);
  const [sizeGuide, setSizeGuide]       = useState(false);
  const [descOpen, setDescOpen]         = useState(true);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [addedToCart, setAddedToCart]   = useState(false);

  const addItem  = useCartStore((s) => s.addItem);
  const openChat = useChatStore((s) => s.openChat);
  const { toggle, has } = useWishlistStore();
  const isWishlisted    = has(product.id);

  const hasDisc  = product.compare_at_price && product.compare_at_price > product.price;
  const discPct  = hasDisc
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  const allSizes       = [...new Set(product.variants.map((v) => v.size))];
  const inStockSizes   = [...new Set(product.variants.filter((v) => v.stock > 0).map((v) => v.size))];
  const selectedVariant = selectedSize
    ? product.variants.find((v) => v.size === selectedSize) ?? null
    : null;
  const maxQty = selectedVariant?.stock ?? 10;

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); setTimeout(() => setSizeError(false), 2500); return; }
    if (!selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleShare = async () => {
    try { await navigator.share({ title: product.name, url: window.location.href }); }
    catch { await navigator.clipboard.writeText(window.location.href); }
  };

  return (
    <div className="py-10 md:py-14">
      <div className="container-brand">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-24">

          {/* Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Details */}
          <div className="lg:pt-2 lg:sticky lg:top-28 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Breadcrumb / category */}
              <div className="flex items-center gap-2 mb-4">
                <span className="label-sm">{product.category?.name}</span>
                {product.is_new && (
                  <span className="bg-brand-black text-white text-[9px] font-semibold tracking-widest-3 uppercase px-2 py-0.5">New</span>
                )}
                {hasDisc && (
                  <span className="bg-brand-accent text-white text-[9px] font-semibold tracking-widest-2 uppercase px-2 py-0.5">-{discPct}%</span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display font-light leading-tight text-brand-black text-balance"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)", letterSpacing: "-0.02em" }}>
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-2xl font-semibold text-brand-black">{formatPrice(product.price)}</span>
                {hasDisc && (
                  <span className="text-base text-brand-stone line-through">{formatPrice(product.compare_at_price!)}</span>
                )}
              </div>

              <div className="my-7 h-px bg-brand-gray-100" />

              {/* Size selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-baseline gap-2">
                    <p className="label-sm">Size</p>
                    {selectedSize && (
                      <span className="text-sm text-brand-black font-medium">— {selectedSize}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setSizeGuide(true)}
                    className="text-[10px] text-brand-stone underline underline-offset-2 hover:text-brand-black transition-colors"
                  >
                    Size Guide
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allSizes.map((sz) => {
                    const inStock = inStockSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        disabled={!inStock}
                        onClick={() => { setSelectedSize(sz); setSizeError(false); setQuantity(1); }}
                        className={cn(
                          "relative h-10 min-w-[44px] px-3 text-xs font-medium border transition-all duration-200",
                          selectedSize === sz
                            ? "bg-brand-black text-white border-brand-black"
                            : inStock
                            ? "border-brand-gray-200 text-brand-muted hover:border-brand-stone"
                            : "border-brand-gray-100 text-brand-gray-300 cursor-not-allowed"
                        )}
                      >
                        {sz}
                        {!inStock && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="absolute w-full h-px bg-brand-gray-200 rotate-45 scale-110" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {sizeError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-xs text-red-500 flex items-center gap-1"
                    >
                      <Info size={11} strokeWidth={2} /> Please select a size to continue
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Quantity */}
              <div className="mb-7">
                <p className="label-sm mb-3">Quantity</p>
                <div className="inline-flex items-center border border-brand-gray-200">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-brand-stone hover:text-brand-black disabled:opacity-30 transition-colors"
                  >–</button>
                  <span className="w-11 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    className="w-10 h-10 flex items-center justify-center text-brand-stone hover:text-brand-black disabled:opacity-30 transition-colors"
                  >+</button>
                </div>
                {selectedVariant && (
                  <span className="ml-3 text-xs text-brand-stone">{selectedVariant.stock} in stock</span>
                )}
              </div>

              {/* CTA row */}
              <div className="flex gap-2.5 mb-5">
                <motion.button
                  onClick={handleAddToCart}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "flex-1 btn-primary justify-center py-4",
                    addedToCart && "bg-brand-green hover:bg-brand-green"
                  )}
                >
                  {addedToCart ? "Added to Bag ✓" : "Add to Bag"}
                </motion.button>

                <button
                  onClick={() => toggle(product.id)}
                  className={cn(
                    "w-12 border flex items-center justify-center transition-all duration-200",
                    isWishlisted
                      ? "bg-brand-black border-brand-black text-white"
                      : "border-brand-gray-200 text-brand-stone hover:border-brand-black hover:text-brand-black"
                  )}
                  aria-label="Wishlist"
                >
                  <Heart size={15} strokeWidth={1.5} className={cn(isWishlisted && "fill-white")} />
                </button>

                <button
                  onClick={handleShare}
                  className="w-12 border border-brand-gray-200 flex items-center justify-center text-brand-stone hover:border-brand-black hover:text-brand-black transition-all"
                  aria-label="Share"
                >
                  <Share2 size={15} strokeWidth={1.5} />
                </button>
              </div>

              {/* Ask about product */}
              <button
                onClick={() => openChat({ productId: product.id, productName: product.name })}
                className="w-full flex items-center justify-center gap-2 py-3 border border-brand-gray-200 label-sm text-brand-stone hover:border-brand-black hover:text-brand-black transition-all mb-8"
              >
                <MessageCircle size={13} strokeWidth={1.5} />
                Ask About This Product
              </button>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 py-6 border-y border-brand-gray-100 mb-6">
                {TRUST.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center text-center gap-1.5">
                    <Icon size={16} strokeWidth={1.5} className="text-brand-stone" />
                    <span className="text-[10px] font-medium text-brand-dark leading-tight">{label}</span>
                    <span className="text-[9px] text-brand-stone leading-tight">{sub}</span>
                  </div>
                ))}
              </div>

              {/* Accordions */}
              <Accordion title="Description" open={descOpen} onToggle={() => setDescOpen((v) => !v)}>
                <p className="text-sm text-brand-muted leading-relaxed">{product.description}</p>
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {product.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2.5 py-1 bg-brand-cream text-brand-ash tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Accordion>

              <Accordion title="Delivery & Returns" open={deliveryOpen} onToggle={() => setDeliveryOpen((v) => !v)}>
                <ul className="text-sm text-brand-muted space-y-2 leading-relaxed">
                  <li>• Dhaka City: <strong className="text-brand-dark">৳60</strong>, 1–2 days</li>
                  <li>• Outside Dhaka: <strong className="text-brand-dark">৳100–130</strong>, 2–4 days</li>
                  <li>• Free delivery on orders over <strong className="text-brand-dark">৳1,500</strong></li>
                  <li>• Returns within <strong className="text-brand-dark">7 days</strong> of delivery</li>
                </ul>
              </Accordion>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {sizeGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSizeGuide(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white shadow-2xl max-h-[90dvh] overflow-auto"
            >
              <div className="flex items-center justify-between px-7 py-5 border-b border-brand-gray-100">
                <h3 className="font-display font-light text-xl text-brand-black">Size Guide</h3>
                <button onClick={() => setSizeGuide(false)} className="text-brand-stone hover:text-brand-black text-2xl leading-none">×</button>
              </div>
              <div className="p-7">
                <p className="text-xs text-brand-stone mb-5">All measurements in centimeters (cm).</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-gray-200">
                        {["Size", "Chest", "Waist", "Hip"].map((h) => (
                          <th key={h} className="pb-3 text-left text-[10px] font-semibold tracking-widest-2 uppercase text-brand-stone">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SIZE_GUIDE.map((row, i) => (
                        <tr key={row.size} className={cn(i % 2 === 0 && "bg-brand-cream/40")}>
                          <td className="py-3 pr-4 font-semibold text-brand-dark">{row.size}</td>
                          <td className="py-3 pr-4 text-brand-muted">{row.chest}</td>
                          <td className="py-3 pr-4 text-brand-muted">{row.waist}</td>
                          <td className="py-3 text-brand-muted">{row.hip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Accordion({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-brand-gray-100">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left"
        aria-expanded={open}
      >
        <span className="label-sm text-brand-dark">{title}</span>
        <ChevronDown
          size={13}
          strokeWidth={1.5}
          className={cn("text-brand-stone transition-transform duration-300", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
