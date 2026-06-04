"use client";
// @ts-nocheck

import { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/constants";

interface AnalyticsData {
  ordersByDay:    { created_at: string; total: number; status: string }[];
  topProducts:    { product_name: string; quantity: number; total_price: number }[];
  ordersByStatus: { status: string }[];
  revenueByArea:  { shipping_address: { area?: string }; total: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "#F59E0B",
  confirmed:  "#3B82F6",
  processing: "#8B5CF6",
  shipped:    "#6366F1",
  delivered:  "#10B981",
  cancelled:  "#EF4444",
};

// recharts v3 formatter receives ValueType | undefined — must handle both
type FmtValue = string | number | (string | number)[] | undefined;
const fmtBDT = (v: FmtValue): string =>
  typeof v === "number" ? formatPrice(v) : String(v ?? "");
const fmtK = (v: FmtValue): string =>
  typeof v === "number" ? `৳${(v / 1000).toFixed(0)}k` : "";

const TOOLTIP_STYLE = {
  background: "#0A0A0A",
  border:     "none",
  fontSize:   12,
  color:      "#FAFAFA",
  borderRadius: 0,
};

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const revenueByDate = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: number }>();
    data.ordersByDay.forEach((o) => {
      const date = new Date(o.created_at).toLocaleDateString("en-BD", {
        month: "short", day: "numeric",
      });
      const ex = map.get(date) ?? { revenue: 0, orders: 0 };
      map.set(date, { revenue: ex.revenue + o.total, orders: ex.orders + 1 });
    });
    return Array.from(map.entries()).map(([date, v]) => ({ date, ...v }));
  }, [data.ordersByDay]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.ordersByStatus.forEach(({ status }) => {
      counts[status] = (counts[status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      status,
      label: ORDER_STATUS_LABELS[status] ?? status,
      count,
      color: STATUS_COLORS[status] ?? "#6B7280",
    }));
  }, [data.ordersByStatus]);

  const topProductsData = useMemo(() => {
    const map = new Map<string, number>();
    data.topProducts.forEach(({ product_name, quantity }) => {
      map.set(product_name, (map.get(product_name) ?? 0) + quantity);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, qty]) => ({ name: name.slice(0, 22), qty }));
  }, [data.topProducts]);

  const areaData = useMemo(() => {
    const map = new Map<string, number>();
    data.revenueByArea.forEach(({ shipping_address, total }) => {
      const area = (shipping_address as { area?: string })?.area ?? "Unknown";
      map.set(area, (map.get(area) ?? 0) + total);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([area, revenue]) => ({ area, revenue }));
  }, [data.revenueByArea]);

  const totalRevenue = data.ordersByDay
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  const kpis = [
    { label: "30-Day Revenue",   value: formatPrice(totalRevenue),                                     sub: "excl. cancelled"  },
    { label: "Total Orders",     value: data.ordersByDay.length.toString(),                            sub: "last 30 days"     },
    { label: "Avg Order Value",  value: data.ordersByDay.length > 0 ? formatPrice(Math.round(totalRevenue / data.ordersByDay.length)) : formatPrice(0), sub: "per order" },
    { label: "Delivered",        value: (statusData.find((s) => s.status === "delivered")?.count ?? 0).toString(), sub: "completed" },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-brand-gray-100 p-5">
            <p className="text-xs text-brand-stone mb-2 tracking-wide">{kpi.label}</p>
            <p className="font-display font-light text-2xl md:text-3xl text-brand-black" style={{ letterSpacing: "-0.02em" }}>
              {kpi.value}
            </p>
            <p className="text-[11px] text-brand-stone mt-1.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      {revenueByDate.length > 0 && (
        <div className="bg-white border border-brand-gray-100 p-5 md:p-6">
          <h2 className="font-display font-light text-lg text-brand-black mb-6" style={{ letterSpacing: "-0.02em" }}>
            Revenue — Last 30 Days
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueByDate} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0A0A0A" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#0A0A0A" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9E9186" }}
                axisLine={false} tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9E9186" }}
                axisLine={false} tickLine={false}
                tickFormatter={fmtK}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: FmtValue) => [fmtBDT(v), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0A0A0A"
                strokeWidth={2}
                fill="url(#rg)"
                dot={false}
                activeDot={{ r: 4, fill: "#0A0A0A" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        {topProductsData.length > 0 && (
          <div className="bg-white border border-brand-gray-100 p-5 md:p-6">
            <h2 className="font-display font-light text-lg text-brand-black mb-6" style={{ letterSpacing: "-0.02em" }}>
              Top Products by Units Sold
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#9E9186" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#5E544C" }} axisLine={false} tickLine={false} width={110} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: FmtValue) => [typeof v === "number" ? v : String(v ?? ""), "Units"]}
                />
                <Bar dataKey="qty" fill="#0A0A0A" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Orders by status */}
        {statusData.length > 0 && (
          <div className="bg-white border border-brand-gray-100 p-5 md:p-6">
            <h2 className="font-display font-light text-lg text-brand-black mb-6" style={{ letterSpacing: "-0.02em" }}>
              Orders by Status
            </h2>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    dataKey="count"
                    paddingAngle={2}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.status} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v: FmtValue, _: FmtValue, entry: { payload?: { label?: string } }) =>
                      [typeof v === "number" ? v : String(v ?? ""), entry?.payload?.label ?? ""]
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5">
                {statusData.map((s) => (
                  <div key={s.status} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-xs text-brand-muted">{s.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-brand-black">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue by area */}
      {areaData.length > 0 && (
        <div className="bg-white border border-brand-gray-100 p-5 md:p-6">
          <h2 className="font-display font-light text-lg text-brand-black mb-6" style={{ letterSpacing: "-0.02em" }}>
            Revenue by Delivery Area
          </h2>
          <div className="space-y-3">
            {areaData.map(({ area, revenue }) => {
              const pct = Math.round((revenue / areaData[0].revenue) * 100);
              return (
                <div key={area} className="flex items-center gap-4">
                  <span className="text-xs text-brand-stone w-44 shrink-0 truncate">{area}</span>
                  <div className="flex-1 h-1.5 bg-brand-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-black rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-brand-black w-24 text-right shrink-0">
                    {formatPrice(revenue)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
