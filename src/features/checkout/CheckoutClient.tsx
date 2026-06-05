"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft, ChevronDown, Truck, Info } from "lucide-react";
import { useAuth }       from "@/hooks/useAuth";
import { useCartStore } from "@/store/cart.store";
import { createOrder } from "@/services/order.service";
import { cn, formatPrice } from "@/lib/utils";
import { DELIVERY_AREAS, SHIPPING_FEES, SITE_CONFIG } from "@/constants";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validations/checkout.schema";

export function CheckoutClient() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { area: DELIVERY_AREAS[0] },
  });

  const selectedArea = watch("area");
  const shippingFee = SHIPPING_FEES[selectedArea] ?? 130;
  const subtotal = totalPrice();
  const freeShipping = subtotal >= 1500;
  const finalShipping = freeShipping ? 0 : shippingFee;
  const finalTotal = subtotal + finalShipping;

  useEffect(() => { if (items.length === 0) router.replace("/shop"); }, [items.length, router]);

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true); setServerError(null);
    const result = await createOrder({ formData: data, items, userId: user?.id ?? null });
    if (!result.success || !result.orderNumber) {
      setServerError(result.error ?? "Something went wrong. Please try again.");
      setIsSubmitting(false); return;
    }
    clearCart();
    router.push(`/order-confirmed?order=${result.orderNumber}`);
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-brand-gray-50">
      <div className="bg-brand-white border-b border-brand-gray-100">
        <div className="container-brand py-5 flex items-center justify-between">
          <Link href="/cart" className="flex items-center gap-1.5 text-xs text-brand-gray-500 hover:text-brand-black transition-colors"><ArrowLeft size={14} strokeWidth={1.5} />Back to cart</Link>
          <Link href="/" className="font-display font-bold text-xl text-brand-black hover:opacity-70">{SITE_CONFIG.name}</Link>
          <div className="w-20" />
        </div>
      </div>
      <div className="container-brand py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-black mb-8">Delivery Details</h1>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-6">
                  <div className="bg-brand-white p-6 md:p-8 space-y-5">
                    <h2 className="label-caps text-brand-gray-700">Contact Information</h2>
                    <Field label="Full Name *" error={errors.full_name?.message}>
                      <input {...register("full_name")} type="text" placeholder="e.g. Rahim Uddin" autoComplete="name" className={inp(!!errors.full_name)} />
                    </Field>
                    <Field label="Phone Number *" error={errors.phone?.message} hint="We&apos;ll call this number for delivery">
                      <input {...register("phone")} type="tel" placeholder="01712345678" autoComplete="tel" inputMode="numeric" className={inp(!!errors.phone)} />
                    </Field>
                  </div>
                  <div className="bg-brand-white p-6 md:p-8 space-y-5">
                    <h2 className="label-caps text-brand-gray-700">Delivery Address</h2>
                    <Field label="Delivery Area *" error={errors.area?.message}>
                      <div className="relative">
                        <select {...register("area")} className={cn(inp(!!errors.area), "appearance-none pr-10 cursor-pointer")}>
                          {DELIVERY_AREAS.map((area) => <option key={area} value={area}>{area} — ৳{SHIPPING_FEES[area]}</option>)}
                        </select>
                        <ChevronDown size={14} strokeWidth={1.5} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400 pointer-events-none" />
                      </div>
                    </Field>
                    <Field label="Full Address *" error={errors.address?.message} hint="House/flat number, road, area">
                      <textarea {...register("address")} rows={3} placeholder="e.g. House 12, Road 4, Mirpur 10, Dhaka" autoComplete="street-address" className={cn(inp(!!errors.address), "resize-none")} />
                    </Field>
                    <Field label="Delivery Note" error={errors.notes?.message} hint="Optional — any special instruction">
                      <input {...register("notes")} type="text" placeholder="e.g. Call before arriving" className={inp(!!errors.notes)} />
                    </Field>
                  </div>
                  <div className="bg-brand-white p-6 md:p-8 space-y-3">
                    <h2 className="label-caps text-brand-gray-700">Payment Method</h2>
                    <div className="flex items-center gap-3 p-4 border border-brand-black bg-brand-gray-50">
                      <div className="w-4 h-4 rounded-full border-2 border-brand-black flex items-center justify-center shrink-0"><div className="w-2 h-2 rounded-full bg-brand-black" /></div>
                      <div><p className="text-sm font-semibold text-brand-black">Cash on Delivery</p><p className="text-xs text-brand-gray-500 mt-0.5">Pay when your order arrives</p></div>
                      <span className="ml-auto text-xs text-brand-gray-400 font-medium">COD</span>
                    </div>
                    <div className="flex items-start gap-2 mt-3 p-3 bg-brand-beige-50 border border-brand-beige-200">
                      <Info size={14} strokeWidth={1.5} className="text-brand-gray-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-brand-gray-500">bKash and Nagad payments coming soon.</p>
                    </div>
                  </div>
                  {serverError && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-200 text-sm text-red-600">{serverError}</motion.div>}
                  <button type="submit" disabled={isSubmitting} className="w-full btn-primary justify-center py-4 text-sm disabled:opacity-60">
                    {isSubmitting ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Placing Order…</span> : `Place Order — ${formatPrice(finalTotal)}`}
                  </button>
                  <p className="text-center text-xs text-brand-gray-400">By placing your order you agree to our <Link href="/terms" className="underline underline-offset-2 hover:text-brand-black">Terms of Service</Link></p>
                </div>
              </form>
            </div>
            <div className="lg:sticky lg:top-28">
              <button onClick={() => setOrderSummaryOpen((v) => !v)} className="lg:hidden w-full flex items-center justify-between p-4 bg-brand-white border border-brand-gray-200 mb-4">
                <div className="flex items-center gap-2 text-sm font-medium"><ShoppingBag size={16} strokeWidth={1.5} />Order Summary ({items.length} items)</div>
                <div className="flex items-center gap-2"><span className="font-semibold">{formatPrice(finalTotal)}</span><ChevronDown size={14} strokeWidth={1.5} className={cn("transition-transform duration-200", orderSummaryOpen && "rotate-180")} /></div>
              </button>
              <div className={cn("bg-brand-white border border-brand-gray-200 p-6", "hidden lg:block", orderSummaryOpen && "!block")}>
                <h2 className="font-display font-semibold text-lg mb-5 hidden lg:block">Order Summary</h2>
                <ul className="space-y-4 mb-6">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-20 bg-brand-gray-100 shrink-0 overflow-hidden">
                        {item.product.images[0] && <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" sizes="64px" />}
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-gray-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-black leading-snug line-clamp-2">{item.product.name}</p>
                        <p className="text-xs text-brand-gray-400 mt-0.5">Size: {item.variant.size}</p>
                      </div>
                      <p className="text-sm font-semibold text-brand-black shrink-0">{formatPrice(item.product.price * item.quantity)}</p>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-brand-gray-100 pt-5 space-y-3">
                  <div className="flex items-start justify-between gap-4"><span className="text-sm text-brand-gray-500">Subtotal</span><span className="text-sm font-medium text-brand-black">{formatPrice(subtotal)}</span></div>
                  <div className="flex items-start justify-between gap-4"><span className="text-sm text-brand-gray-500">Delivery<span className="block text-[11px] text-brand-gray-400">{selectedArea}</span></span><span className={cn("text-sm font-medium text-brand-black", freeShipping && "text-green-600 font-semibold")}>{freeShipping ? "Free" : formatPrice(shippingFee)}</span></div>
                  {freeShipping && <div className="flex items-center gap-1.5 text-xs text-green-600"><Truck size={12} strokeWidth={1.5} />Free delivery applied!</div>}
                </div>
                <div className="border-t border-brand-gray-200 mt-4 pt-4">
                  <div className="flex items-start justify-between gap-4 text-base font-bold text-brand-black"><span>Total</span><span>{formatPrice(finalTotal)}</span></div>
                  <p className="text-xs text-brand-gray-400 mt-1">Including all taxes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-brand-gray-700 mb-1.5 tracking-wide">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-[11px] text-brand-gray-400">{hint}</p>}
      {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-[11px] text-red-500">{error}</motion.p>}
    </div>
  );
}

function inp(hasError: boolean) {
  return cn("w-full px-4 py-3 text-sm text-brand-black bg-brand-white border outline-none transition-colors placeholder:text-brand-gray-300", hasError ? "border-red-300 focus:border-red-400" : "border-brand-gray-200 focus:border-brand-gray-500");
}
