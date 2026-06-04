"use client";
// @ts-nocheck

import { useEffect }  from "react";
import Image           from "next/image";
import Link            from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCartStore }  from "@/store/cart.store";
import { formatPrice }   from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore();

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, closeCart]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const subtotal = totalPrice();
  const free     = subtotal >= 1500;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[440px] bg-brand-white flex flex-col shadow-2xl"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-brand-gray-100">
              <div className="flex items-baseline gap-2">
                <h2 className="font-display font-light text-xl text-brand-black">Your Bag</h2>
                {items.length > 0 && (
                  <span className="text-xs text-brand-stone">({items.length})</span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center text-brand-stone hover:text-brand-black transition-colors"
                aria-label="Close"
              >
                <X size={17} strokeWidth={1.5} />
              </button>
            </div>

            {/* Free shipping progress */}
            {items.length > 0 && !free && (
              <div className="px-7 py-3 bg-brand-cream/60 border-b border-brand-gray-100">
                <p className="text-[11px] text-brand-muted mb-2">
                  Add <span className="font-semibold text-brand-black">{formatPrice(1500 - subtotal)}</span> more for free Dhaka delivery
                </p>
                <div className="h-0.5 bg-brand-warm rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-black rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / 1500) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {items.length > 0 && free && (
              <div className="px-7 py-2.5 bg-brand-green/8 border-b border-brand-gray-100">
                <p className="text-[11px] text-brand-green font-medium">✓ Free delivery unlocked!</p>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-7 py-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-5 text-center py-16">
                  <ShoppingBag size={40} strokeWidth={1} className="text-brand-warm" />
                  <div>
                    <p className="font-display font-light text-xl text-brand-dark">Your bag is empty</p>
                    <p className="text-sm text-brand-stone mt-1.5">Start shopping to fill it up</p>
                  </div>
                  <button onClick={closeCart} className="btn-outline btn-sm">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-6">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4">
                      {/* Image */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        onClick={closeCart}
                        className="relative w-20 h-24 shrink-0 bg-brand-cream overflow-hidden"
                      >
                        {item.product.images[0] && (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        )}
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${item.product.slug}`}
                            onClick={closeCart}
                            className="text-sm font-medium text-brand-dark leading-snug hover:text-brand-black transition-colors line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="shrink-0 text-brand-stone hover:text-red-500 transition-colors mt-0.5"
                            aria-label="Remove"
                          >
                            <Trash2 size={13} strokeWidth={1.5} />
                          </button>
                        </div>

                        <p className="text-xs text-brand-stone mt-1">Size: {item.variant.size}</p>

                        <div className="flex items-center justify-between mt-3">
                          {/* Qty */}
                          <div className="flex items-center border border-brand-gray-200">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 flex items-center justify-center text-brand-stone hover:text-brand-black disabled:opacity-30 transition-colors"
                            >
                              <Minus size={11} strokeWidth={2} />
                            </button>
                            <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.variant.stock}
                              className="w-7 h-7 flex items-center justify-center text-brand-stone hover:text-brand-black disabled:opacity-30 transition-colors"
                            >
                              <Plus size={11} strokeWidth={2} />
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-brand-black">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-brand-gray-100 px-7 py-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brand-stone">Subtotal</span>
                  <span className="text-base font-semibold text-brand-black">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-[11px] text-brand-stone">
                  Shipping calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full justify-between"
                >
                  <span>Checkout</span>
                  <ArrowRight size={14} strokeWidth={1.5} />
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full text-center text-[0.6875rem] text-brand-stone hover:text-brand-black transition-colors tracking-widest uppercase py-1"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
