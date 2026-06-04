import type { Metadata }      from "next";
import { createClient }       from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/features/admin/analytics/AnalyticsDashboard";

export const metadata: Metadata = { title: "Analytics" };

async function getAnalyticsData() {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { data: ordersByDay    },
    { data: topProducts    },
    { data: ordersByStatus },
    { data: revenueByArea  },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("created_at, total, status")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at"),
    supabase
      .from("order_items")
      .select("product_name, quantity, total_price")
      .order("total_price", { ascending: false })
      .limit(10),
    supabase.from("orders").select("status"),
    supabase
      .from("orders")
      .select("shipping_address, total")
      .neq("status", "cancelled"),
  ]);

  return {
    ordersByDay:    (ordersByDay    ?? []) as { created_at: string; total: number; status: string }[],
    topProducts:    (topProducts    ?? []) as { product_name: string; quantity: number; total_price: number }[],
    ordersByStatus: (ordersByStatus ?? []) as { status: string }[],
    revenueByArea:  (revenueByArea  ?? []) as { shipping_address: { area?: string }; total: number }[],
  };
}

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsData();
  return <AnalyticsDashboard data={data} />;
}
