"use client";

import { motion } from "framer-motion";
import { TrendingUp, ShoppingCart, Package, Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalOrders:    number;
  totalProducts:  number;
  totalCustomers: number;
  totalRevenue:   number;
}

const CARDS = [
  {
    label: "Total Revenue",
    key:   "totalRevenue" as const,
    icon:  TrendingUp,
    fmt:   (v: number) => formatPrice(v),
    trend: "+12% vs last month",
    color: "text-emerald-600",
    bg:    "bg-emerald-50",
  },
  {
    label: "Total Orders",
    key:   "totalOrders" as const,
    icon:  ShoppingCart,
    fmt:   (v: number) => v.toLocaleString(),
    trend: "+8% this week",
    color: "text-blue-600",
    bg:    "bg-blue-50",
  },
  {
    label: "Products",
    key:   "totalProducts" as const,
    icon:  Package,
    fmt:   (v: number) => v.toLocaleString(),
    trend: "Active listings",
    color: "text-violet-600",
    bg:    "bg-violet-50",
  },
  {
    label: "Customers",
    key:   "totalCustomers" as const,
    icon:  Users,
    fmt:   (v: number) => v.toLocaleString(),
    trend: "+5 this week",
    color: "text-amber-600",
    bg:    "bg-amber-50",
  },
];

export function DashboardStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="bg-white border border-brand-gray-100 p-5 md:p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-medium text-brand-stone tracking-wide">{card.label}</p>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${card.bg}`}>
                <Icon size={14} strokeWidth={2} className={card.color} />
              </div>
            </div>
            <p className="font-display font-light text-2xl md:text-3xl text-brand-black" style={{ letterSpacing: "-0.02em" }}>
              {card.fmt(stats[card.key])}
            </p>
            <p className="text-[11px] text-brand-stone mt-1.5">{card.trend}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
