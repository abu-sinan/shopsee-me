import type { Metadata }        from "next";
import { Suspense }             from "react";
import { createClient }         from "@/lib/supabase/server";
import { AdminOrdersClient }    from "@/features/admin/orders/AdminOrdersClient";

export const metadata: Metadata = { title: "Orders" };

async function getOrders() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(`
      id, order_number, status, customer_name, customer_phone,
      total, shipping_fee, shipping_address, payment_method, notes, created_at,
      order_items(id, product_name, size, quantity, total_price)
    `)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return (
    <Suspense fallback={
      <div className="h-64 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-gray-200 border-t-brand-black rounded-full animate-spin" />
      </div>
    }>
      <AdminOrdersClient initialOrders={orders} />
    </Suspense>
  );
}
