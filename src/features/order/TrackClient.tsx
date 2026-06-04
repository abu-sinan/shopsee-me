"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Package, Truck, Home, CheckCircle2, Search, XCircle, ArrowRight, Phone } from "lucide-react";
import { getOrderByNumber } from "@/services/order.service";
import { cn, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/constants";

type OrderData = Awaited<ReturnType<typeof getOrderByNumber>>;
const trackSchema = z.object({ orderNumber: z.string().min(5, "Please enter a valid order number").regex(/^SSM-/i, "Order numbers start with SSM-") });
type TrackFormValues = z.infer<typeof trackSchema>;

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: CheckCircle2, description: "We've received your order and are verifying it." },
  { key: "confirmed", label: "Confirmed", icon: Package, description: "Your order has been confirmed and is being packed." },
  { key: "processing", label: "Processing", icon: Package, description: "Your items are being prepared." },
  { key: "shipped", label: "Out for Delivery", icon: Truck, description: "Your order is on its way to you." },
  { key: "delivered", label: "Delivered", icon: Home, description: "Your order has been delivered successfully." },
] as const;

export function TrackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TrackFormValues>({ resolver: zodResolver(trackSchema) });
  const urlOrder = searchParams.get("order");

  const doSearch = useCallback(async (num: string) => {
    setSearching(true); setNotFound(false); setOrder(null);
    const data = await getOrderByNumber(num.trim().toUpperCase());
    if (data) { setOrder(data); router.replace(`/track?order=${data.order_number}`, { scroll: false }); }
    else setNotFound(true);
    setSearching(false);
  }, [router]);

  useEffect(() => { if (urlOrder) { setValue("orderNumber", urlOrder); doSearch(urlOrder); } }, [urlOrder, setValue, doSearch]);

  const onSubmit = (data: TrackFormValues) => doSearch(data.orderNumber);
  const currentStepIndex = order ? STATUS_STEPS.findIndex((s) => s.key === order.status) : -1;
  const address = order?.shipping_address as { line1: string; area: string; notes?: string } | undefined;

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container-brand max-w-xl mx-auto">
        <div className="text-center mb-10">
          <p className="label-caps mb-3">Order Status</p>
          <h1 className="heading-lg text-brand-black">Track Your Order</h1>
          <p className="body-md mt-3 text-brand-gray-500 max-w-sm mx-auto">Enter your order number to see the current delivery status.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
          <div className={cn("flex items-center border transition-colors duration-200", errors.orderNumber ? "border-red-300" : "border-brand-gray-200 focus-within:border-brand-gray-500")}>
            <input {...register("orderNumber")} type="text" placeholder="e.g. SSM-M8XQ2K-A1B2" className="flex-1 px-4 py-4 text-sm bg-transparent text-brand-black placeholder:text-brand-gray-300 outline-none" autoComplete="off" spellCheck={false} />
            <button type="submit" disabled={searching} className="px-5 py-4 bg-brand-black text-white hover:bg-brand-gray-800 transition-colors disabled:opacity-60 flex items-center gap-2 text-xs font-medium tracking-widest uppercase">
              {searching ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={14} strokeWidth={1.5} />}
              <span className="hidden sm:block">Track</span>
            </button>
          </div>
          {errors.orderNumber && <p className="mt-1.5 text-xs text-red-500">{errors.orderNumber.message}</p>}
        </form>
        <AnimatePresence>
          {notFound && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 mb-6">
              <XCircle size={16} strokeWidth={1.5} className="text-red-500 mt-0.5 shrink-0" />
              <div><p className="text-sm font-medium text-red-700">Order not found</p><p className="text-xs text-red-500 mt-0.5">Please check the order number and try again.</p></div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {order && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <div className="bg-brand-black text-white px-6 py-5 mb-1">
                <div className="flex items-center justify-between">
                  <div><p className="text-[10px] tracking-widest-2 uppercase text-white/50 mb-1">Order Number</p><p className="font-display font-bold text-lg tracking-wide">{order.order_number}</p></div>
                  <div className="text-right"><p className="text-[10px] tracking-widest-2 uppercase text-white/50 mb-1">Status</p><p className="text-sm font-semibold text-brand-accent">{ORDER_STATUS_LABELS[order.status]}</p></div>
                </div>
              </div>
              <div className="bg-brand-white border border-brand-gray-100 p-6 mb-4">
                <div className="space-y-0">
                  {STATUS_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const completed = i < currentStepIndex;
                    const current = i === currentStepIndex;
                    const isLast = i === STATUS_STEPS.length - 1;
                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn("w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all", completed ? "bg-brand-black border-brand-black" : current ? "bg-brand-black border-brand-black ring-4 ring-brand-gray-100" : "bg-brand-white border-brand-gray-200")}>
                            <Icon size={14} strokeWidth={1.5} className={cn(completed || current ? "text-white" : "text-brand-gray-300")} />
                          </div>
                          {!isLast && <div className={cn("w-px flex-1 my-1 min-h-[28px] transition-colors", completed ? "bg-brand-black" : "bg-brand-gray-200")} />}
                        </div>
                        <div className={cn("pb-6", isLast && "pb-0")}>
                          <p className={cn("text-sm font-semibold leading-none mb-1 mt-2", !completed && !current ? "text-brand-gray-300" : "text-brand-black")}>{step.label}</p>
                          {(completed || current) && <p className="text-xs text-brand-gray-500 leading-relaxed">{step.description}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {address && (
                <div className="bg-brand-white border border-brand-gray-100 px-6 py-5 mb-4">
                  <p className="label-caps mb-3">Delivering To</p>
                  <p className="text-sm font-medium text-brand-black">{order.customer_name}</p>
                  <div className="flex items-center gap-1.5 text-sm text-brand-gray-500"><Phone size={12} strokeWidth={1.5} />{order.customer_phone}</div>
                  <p className="text-sm text-brand-gray-500">{address.line1}, {address.area}</p>
                </div>
              )}
              <div className="bg-brand-white border border-brand-gray-100 px-6 py-5 mb-6">
                <p className="label-caps mb-4">Order Summary</p>
                <ul className="space-y-2.5 mb-4">
                  {order.order_items?.map((item: { id: string; product_name: string; size: string; quantity: number; total_price: number }) => (
                    <li key={item.id} className="flex justify-between gap-4">
                      <span className="text-sm text-brand-gray-600">{item.product_name}<span className="text-brand-gray-400 ml-1.5">(Size: {item.size} × {item.quantity})</span></span>
                      <span className="text-sm font-medium text-brand-black shrink-0">{formatPrice(item.total_price)}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-brand-gray-100 pt-3 flex justify-between">
                  <span className="text-sm font-bold text-brand-black">Total Paid</span>
                  <span className="text-sm font-bold text-brand-black">{formatPrice(order.total)}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-brand-gray-500 mb-3">Need help with your order?</p>
                <Link href="/contact" className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-black underline underline-offset-2 hover:opacity-70">Contact Support <ArrowRight size={12} strokeWidth={1.5} /></Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
