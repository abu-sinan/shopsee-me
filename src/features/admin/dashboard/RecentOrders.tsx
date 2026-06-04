import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/constants";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

interface Order { id: string; order_number: string; status: string; customer_name: string; customer_phone: string; total: number; created_at: string; order_items: { id: string }[]; }

export function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <div className="bg-white border border-brand-gray-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-brand-gray-100">
        <h2 className="font-display font-semibold text-base text-brand-black">Recent Orders</h2>
        <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-brand-gray-500 hover:text-brand-black">View all <ArrowRight size={11} strokeWidth={1.5} /></Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-gray-100">
              {["Order", "Customer", "Items", "Total", "Status", "Date"].map((h) => <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold tracking-widest uppercase text-brand-gray-400">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-brand-gray-400">No orders yet</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="border-b border-brand-gray-50 hover:bg-brand-gray-50 transition-colors">
                <td className="px-5 py-3.5"><Link href={`/admin/orders`} className="font-mono text-xs font-medium text-brand-black hover:opacity-70">{order.order_number}</Link></td>
                <td className="px-5 py-3.5"><p className="font-medium text-brand-black text-xs">{order.customer_name}</p><p className="text-brand-gray-400 text-[11px]">{order.customer_phone}</p></td>
                <td className="px-5 py-3.5 text-xs text-brand-gray-600">{order.order_items?.length ?? 0}</td>
                <td className="px-5 py-3.5 text-xs font-semibold text-brand-black">{formatPrice(order.total)}</td>
                <td className="px-5 py-3.5"><span className={cn("text-[10px] font-semibold tracking-wider uppercase px-2 py-1 border", STATUS_STYLES[order.status] ?? "bg-brand-gray-100 text-brand-gray-600")}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</span></td>
                <td className="px-5 py-3.5 text-[11px] text-brand-gray-400 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString("en-BD", { day: "numeric", month: "short" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
