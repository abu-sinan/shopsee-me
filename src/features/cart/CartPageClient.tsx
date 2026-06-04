"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ArrowRight, ShoppingBag, Tag } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { cn, formatPrice } from "@/lib/utils";
import { SHIPPING_FEES } from "@/constants";

export function CartPageClient() {
  const { items, removeItem, updateQuantity, totalPrice, _hasHydrated } = useCartStore();
  const subtotal = totalPrice();
  const shipping = subtotal >= 1500 ? 0 : SHIPPING_FEES["Dhaka City"];
  const total = subtotal + shipping;
  const freeShippingRemaining = Math.max(0, 1500 - subtotal);

  if (!_hasHydrated) return null;
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <ShoppingBag size={52} strokeWidth={1} className="text-brand-gray-200" />
        <div><h1 className="font-display text-2xl font-bold text-brand-black mb-2">Your bag is empty</h1><p className="text-sm text-brand-gray-500">Looks like you haven&apos;t added anything yet.</p></div>
        <Link href="/shop" className="btn-primary mt-2 gap-2">Start Shopping <ArrowRight size={14} strokeWidth={1.5} /></Link>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16">
      <div className="container-brand max-w-5xl mx-auto">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-black mb-8">Your Bag ({items.length})</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
          <div>
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <div className="flex gap-4 md:gap-6 py-6 border-b border-brand-gray-100">
                    <Link href={`/product/${item.product.slug}`} className="relative w-24 h-32 md:w-28 md:h-36 shrink-0 bg-brand-gray-100 overflow-hidden">
                      {item.product.images[0] && <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" sizes="112px" />}
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/product/${item.product.slug}`} className="text-sm md:text-base font-medium text-brand-black leading-snug hover:opacity-70 line-clamp-2">{item.product.name}</Link>
                          <p className="text-xs text-brand-gray-400 mt-1">Size: <span className="font-medium">{item.variant.size}</span></p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="shrink-0 p-1 text-brand-gray-300 hover:text-brand-black transition-colors" aria-label="Remove"><X size={16} strokeWidth={1.5} /></button>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border border-brand-gray-200">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-9 h-9 flex items-center justify-center text-brand-gray-500 hover:text-brand-black disabled:opacity-30 transition-colors"><Minus size={12} strokeWidth={2} /></button>
                          <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.variant.stock} className="w-9 h-9 flex items-center justify-center text-brand-gray-500 hover:text-brand-black disabled:opacity-30 transition-colors"><Plus size={12} strokeWidth={2} /></button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm md:text-base font-semibold text-brand-black">{formatPrice(item.product.price * item.quantity)}</p>
                          {item.quantity > 1 && <p className="text-xs text-brand-gray-400">{formatPrice(item.product.price)} each</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="lg:sticky lg:top-28">
            <div className="bg-brand-gray-50 p-6 md:p-8 border border-brand-gray-100">
              <h2 className="font-display font-semibold text-lg mb-6">Order Summary</h2>
              {freeShippingRemaining > 0 && (
                <div className="mb-5 p-3.5 bg-brand-beige-50 border border-brand-beige-200">
                  <div className="flex items-center gap-2 mb-2"><Tag size={12} strokeWidth={1.5} className="text-brand-gray-500" /><p className="text-xs text-brand-gray-600">Add <strong>{formatPrice(freeShippingRemaining)}</strong> more for free Dhaka delivery</p></div>
                  <div className="h-1 bg-brand-beige-200 rounded-full overflow-hidden"><div className="h-full bg-brand-black rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (subtotal / 1500) * 100)}%` }} /></div>
                </div>
              )}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm"><span className="text-brand-gray-500">Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-brand-gray-500">Delivery (Dhaka est.)</span><span className={cn("font-medium", shipping === 0 && "text-green-600")}>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
              </div>
              <div className="border-t border-brand-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center"><span className="text-base font-bold text-brand-black">Total</span><span className="text-xl font-bold text-brand-black">{formatPrice(total)}</span></div>
                <p className="text-xs text-brand-gray-400 mt-1">Final delivery cost calculated at checkout</p>
              </div>
              <Link href="/checkout" className="btn-primary w-full justify-between py-4"><span>Proceed to Checkout</span><ArrowRight size={14} strokeWidth={1.5} /></Link>
              <Link href="/shop" className="block text-center mt-4 text-xs text-brand-gray-400 hover:text-brand-black transition-colors">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
