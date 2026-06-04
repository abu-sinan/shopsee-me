"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/constants";
import { toast } from "@/store/toast.store";

type OrderStatus = "pending"|"confirmed"|"processing"|"shipped"|"delivered"|"cancelled";
const ALL_STATUSES: OrderStatus[] = ["pending","confirmed","processing","shipped","delivered","cancelled"];
const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:"bg-yellow-50 text-yellow-700 border-yellow-200", confirmed:"bg-blue-50 text-blue-700 border-blue-200",
  processing:"bg-purple-50 text-purple-700 border-purple-200", shipped:"bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered:"bg-green-50 text-green-700 border-green-200", cancelled:"bg-red-50 text-red-700 border-red-200",
};

interface OI { id:string; product_name:string; size:string; quantity:number; total_price:number; }
interface AO { id:string; order_number:string; status:OrderStatus; customer_name:string; customer_phone:string; total:number; shipping_fee:number; shipping_address:{line1:string;area:string}; payment_method:string; notes:string|null; created_at:string; order_items:OI[]; }

export function AdminOrdersClient({ initialOrders }: { initialOrders: AO[] }) {
  const [orders, setOrders] = useState<AO[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState<OrderStatus|"all">("all");
  const [expandedId, setExpanded] = useState<string|null>(null);
  const [updatingId, setUpdatingId] = useState<string|null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.customer_phone.includes(search);
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (!error) { setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))); toast.success("Order status updated"); }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders, customers…" className="w-full pl-9 pr-4 py-2.5 text-sm border border-brand-gray-200 bg-white outline-none focus:border-brand-gray-400 transition-colors" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", ...ALL_STATUSES] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={cn("px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase border transition-all", filterStatus === s ? "bg-brand-black text-white border-brand-black" : "bg-white text-brand-gray-500 border-brand-gray-200 hover:border-brand-gray-400")}>
              {s === "all" ? "All" : ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-brand-gray-500">{filtered.length} orders</p>
      <div className="space-y-2">
        {filtered.map((order) => (
          <div key={order.id} className="bg-white border border-brand-gray-200 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 px-5 py-4 cursor-pointer hover:bg-brand-gray-50 transition-colors" onClick={() => setExpanded(expandedId === order.id ? null : order.id)}>
              <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div><p className="text-[10px] text-brand-gray-400 mb-0.5">Order</p><p className="font-mono text-xs font-semibold text-brand-black">{order.order_number}</p></div>
                <div><p className="text-[10px] text-brand-gray-400 mb-0.5">Customer</p><p className="text-xs font-medium text-brand-black truncate">{order.customer_name}</p><p className="text-[10px] text-brand-gray-500">{order.customer_phone}</p></div>
                <div><p className="text-[10px] text-brand-gray-400 mb-0.5">Total</p><p className="text-sm font-bold text-brand-black">{formatPrice(order.total)}</p></div>
                <div><p className="text-[10px] text-brand-gray-400 mb-0.5">Date</p><p className="text-xs text-brand-gray-600">{new Date(order.created_at).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}</p></div>
              </div>
              <div className="flex items-center gap-3 sm:ml-4">
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)} disabled={updatingId === order.id}
                    className={cn("text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1.5 border appearance-none cursor-pointer pr-6 outline-none", STATUS_STYLES[order.status])}>
                    {ALL_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
                  </select>
                  <ChevronDown size={10} strokeWidth={2} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <ChevronDown size={14} strokeWidth={1.5} className={cn("text-brand-gray-400 transition-transform shrink-0", expandedId === order.id && "rotate-180")} />
              </div>
            </div>
            <motion.div initial={false} animate={{ height: expandedId === order.id ? "auto" : 0, opacity: expandedId === order.id ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="px-5 py-5 border-t border-brand-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="label-caps mb-3">Items</p>
                  <ul className="space-y-2">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-brand-gray-700">{item.product_name}<span className="text-brand-gray-400 ml-2 text-xs">({item.size} × {item.quantity})</span></span>
                        <span className="font-medium text-brand-black">{formatPrice(item.total_price)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-brand-gray-100 mt-3 pt-3 flex justify-between text-sm font-bold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
                </div>
                <div>
                  <p className="label-caps mb-3">Delivery Address</p>
                  <p className="text-sm text-brand-gray-700">{order.shipping_address.line1}</p>
                  <p className="text-sm text-brand-gray-700">{order.shipping_address.area}</p>
                  {order.notes && <p className="text-xs text-brand-gray-500 mt-2 italic">Note: {order.notes}</p>}
                  <p className="text-xs text-brand-gray-400 mt-3">Payment: {order.payment_method.toUpperCase()} · Delivery fee: {formatPrice(order.shipping_fee)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
        {filtered.length === 0 && <div className="bg-white border border-brand-gray-200 py-16 text-center"><p className="text-sm text-brand-gray-400">No orders found</p></div>}
      </div>
    </div>
  );
}
