"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Package, Truck, Home, Phone, ArrowRight, ShoppingBag } from "lucide-react";
import { getOrderByNumber } from "@/services/order.service";
import { formatPrice, cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, SITE_CONFIG } from "@/constants";

type OrderData = Awaited<ReturnType<typeof getOrderByNumber>>;
const STEPS = [
  { key: "pending", label: "Order Placed", icon: CheckCircle2 },
  { key: "confirmed", label: "Confirmed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
] as const;

export function OrderConfirmedClient() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "";
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) { setLoading(false); return; }
    getOrderByNumber(orderNumber).then((data) => { setOrder(data); setLoading(false); });
  }, [orderNumber]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-brand-gray-200 border-t-brand-black rounded-full animate-spin" /></div>;

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <ShoppingBag size={40} strokeWidth={1} className="text-brand-gray-200" />
      <h1 className="font-display text-2xl font-bold text-brand-black">Order not found</h1>
      <Link href="/" className="btn-primary mt-2">Return Home</Link>
    </div>
  );

  const address = order.shipping_address as { line1: string; area: string; notes?: string };
  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-brand-gray-50 py-12 md:py-16">
      <div className="container-brand max-w-2xl mx-auto">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }} className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} strokeWidth={1.5} className="text-green-600" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <p className="label-caps mb-2">Order Received</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-black">Thank You!</h1>
            <p className="mt-3 text-sm text-brand-gray-500">Your order has been placed successfully.</p>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="bg-brand-white border border-brand-gray-200 mb-6">
          <div className="px-6 py-5 border-b border-brand-gray-100 flex items-center justify-between">
            <div><p className="label-caps mb-1">Order Number</p><p className="font-display font-bold text-xl text-brand-black tracking-wide">{order.order_number}</p></div>
            <span className={cn("text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5", order.status === "delivered" ? "bg-green-100 text-green-700" : order.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-brand-beige-100 text-brand-gray-700")}>{ORDER_STATUS_LABELS[order.status]}</span>
          </div>
          <div className="px-6 py-6 border-b border-brand-gray-100">
            <div className="relative flex items-start justify-between">
              <div className="absolute top-4 left-4 right-4 h-px bg-brand-gray-200" />
              <div className="absolute top-4 left-4 h-px bg-brand-black transition-all duration-700" style={{ width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%` }} />
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const completed = i <= currentStepIndex;
                return (
                  <div key={step.key} className="relative flex flex-col items-center gap-2 z-10">
                    <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all", completed ? "bg-brand-black border-brand-black" : "bg-brand-white border-brand-gray-200")}>
                      <Icon size={14} strokeWidth={1.5} className={completed ? "text-white" : "text-brand-gray-300"} />
                    </div>
                    <span className={cn("text-[10px] font-medium text-center max-w-[60px]", completed ? "text-brand-black" : "text-brand-gray-400")}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="px-6 py-5 border-b border-brand-gray-100">
            <p className="label-caps mb-3">Delivery Details</p>
            <p className="text-sm font-medium text-brand-black">{order.customer_name}</p>
            <div className="flex items-center gap-1.5 text-sm text-brand-gray-600"><Phone size={12} strokeWidth={1.5} />{order.customer_phone}</div>
            <p className="text-sm text-brand-gray-600">{address.line1}, {address.area}</p>
          </div>
          <div className="px-6 py-5 border-b border-brand-gray-100">
            <p className="label-caps mb-4">Items Ordered</p>
            <ul className="space-y-3">
              {order.order_items?.map((item: { id: string; product_name: string; size: string; quantity: number; total_price: number }) => (
                <li key={item.id} className="flex items-center justify-between gap-4">
                  <div><p className="text-sm font-medium text-brand-black">{item.product_name}</p><p className="text-xs text-brand-gray-400">Size: {item.size} · Qty: {item.quantity}</p></div>
                  <p className="text-sm font-semibold text-brand-black shrink-0">{formatPrice(item.total_price)}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-brand-gray-500"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm text-brand-gray-500"><span>Delivery</span><span>{order.shipping_fee === 0 ? "Free" : formatPrice(order.shipping_fee)}</span></div>
              <div className="flex justify-between text-base font-bold text-brand-black pt-2 border-t border-brand-gray-100"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="bg-brand-beige-50 border border-brand-beige-200 px-6 py-5 mb-8">
          <p className="text-sm text-brand-gray-700 leading-relaxed">📦 Our team will confirm your order within <strong>1-2 hours</strong> via phone call. For any questions, contact us at <a href={`tel:${SITE_CONFIG.phone}`} className="font-semibold text-brand-black underline">{SITE_CONFIG.phone}</a></p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="flex flex-col sm:flex-row gap-3">
          <Link href={`/track?order=${order.order_number}`} className="btn-outline flex-1 justify-center py-3.5 gap-2"><Package size={14} strokeWidth={1.5} />Track Order</Link>
          <Link href="/shop" className="btn-primary flex-1 justify-center py-3.5 gap-2">Continue Shopping <ArrowRight size={14} strokeWidth={1.5} /></Link>
        </motion.div>
      </div>
    </div>
  );
}
