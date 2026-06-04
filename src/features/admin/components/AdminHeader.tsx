"use client";

import { usePathname } from "next/navigation";
import { Bell }        from "lucide-react";
import { useAuth }     from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";

const TITLES: Record<string, string> = {
  "/admin":            "Dashboard",
  "/admin/products":   "Products",
  "/admin/categories": "Categories",
  "/admin/orders":     "Orders",
  "/admin/customers":  "Customers",
  "/admin/messages":   "Messages",
  "/admin/analytics":  "Analytics",
  "/admin/settings":   "Settings",
};

export function AdminHeader() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const title = Object.entries(TITLES)
    .reverse()
    .find(([key]) => pathname.startsWith(key))?.[1] ?? "Admin";

  const initials = profile
    ? getInitials(profile.full_name ?? profile.email)
    : "A";

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#F4F1EC]/90 backdrop-blur-xl border-b border-brand-gray-200 flex items-center px-4 md:px-8 justify-between shrink-0">
      {/* Title */}
      <h1 className="font-display font-light text-xl text-brand-black pl-12 lg:pl-0">
        {title}
      </h1>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="relative w-9 h-9 flex items-center justify-center text-brand-stone hover:text-brand-black transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} strokeWidth={1.5} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-accent rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 bg-brand-dark rounded-full flex items-center justify-center text-white text-[11px] font-bold tracking-wide ml-1">
          {initials}
        </div>
      </div>
    </header>
  );
}
