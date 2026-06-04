import type { Metadata }    from "next";
import { createClient }     from "@/lib/supabase/server";
import { DashboardStats }   from "@/features/admin/dashboard/DashboardStats";
import { RecentOrders }     from "@/features/admin/dashboard/RecentOrders";
import { RecentMessages }   from "@/features/admin/dashboard/RecentMessages";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardData() {
  const supabase = await createClient();

  const [
    { count: totalOrders   },
    { count: totalProducts },
    { count: totalCustomers},
    { data:  revenueData   },
    { data:  recentOrders  },
    { data:  recentConvs   },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("orders").select("total").neq("status", "cancelled"),
    supabase.from("orders")
      .select("id, order_number, status, customer_name, customer_phone, total, created_at, order_items(id)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("conversations")
      .select("id, customer_name, product_name, last_message, last_message_at, status")
      .eq("status", "open")
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(5),
  ]);

  const totalRevenue = (revenueData ?? []).reduce(
    (sum: number, o: { total: number }) => sum + (o.total ?? 0),
    0
  );

  return {
    stats: {
      totalOrders:    totalOrders    ?? 0,
      totalProducts:  totalProducts  ?? 0,
      totalCustomers: totalCustomers ?? 0,
      totalRevenue,
    },
    recentOrders: (recentOrders ?? []) as {
      id: string; order_number: string; status: string;
      customer_name: string; customer_phone: string;
      total: number; created_at: string;
      order_items: { id: string }[];
    }[],
    recentConvs: (recentConvs ?? []) as {
      id: string; customer_name: string; product_name: string | null;
      last_message: string | null; last_message_at: string | null; status: string;
    }[],
  };
}

export default async function AdminDashboard() {
  const { stats, recentOrders, recentConvs } = await getDashboardData();
  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h2 className="font-display font-bold text-2xl text-brand-black">Welcome back</h2>
        <p className="text-sm text-brand-gray-500 mt-1">Here&apos;s what&apos;s happening today.</p>
      </div>
      <DashboardStats stats={stats} />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <RecentOrders orders={recentOrders} />
        <RecentMessages conversations={recentConvs} />
      </div>
    </div>
  );
}
