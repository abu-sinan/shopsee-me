"use client";

import { useState }  from "react";
import Link          from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, Tags, ShoppingCart, Users,
  MessageSquare, BarChart3, Settings, Menu, X, LogOut,
  ExternalLink,
} from "lucide-react";
import { cn }          from "@/lib/utils";
import { signOut }     from "@/services/auth.service";
import { SITE_CONFIG } from "@/constants";

const NAV = [
  { href: "/admin",            label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/products",   label: "Products",   icon: Package         },
  { href: "/admin/categories", label: "Categories", icon: Tags            },
  { href: "/admin/orders",     label: "Orders",     icon: ShoppingCart    },
  { href: "/admin/customers",  label: "Customers",  icon: Users           },
  { href: "/admin/messages",   label: "Messages",   icon: MessageSquare   },
  { href: "/admin/analytics",  label: "Analytics",  icon: BarChart3       },
  { href: "/admin/settings",   label: "Settings",   icon: Settings        },
] as const;

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="h-full flex flex-col bg-brand-black">
      {/* Logo */}
      <div className="px-6 h-16 flex items-center justify-between border-b border-white/5 shrink-0">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-display font-light text-xl text-white group-hover:opacity-70 transition-opacity">
            {SITE_CONFIG.name}
          </span>
          <ExternalLink size={11} strokeWidth={1.5} className="text-white/20 group-hover:text-white/40 transition-colors" />
        </Link>
        <span className="text-[9px] font-semibold bg-white/10 text-white/50 px-2 py-0.5 tracking-widest-3 uppercase rounded-sm">
          Admin
        </span>
        {onClose && (
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors ml-2" aria-label="Close">
            <X size={17} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 text-sm transition-all duration-200 group",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <Icon
                size={15}
                strokeWidth={active ? 2 : 1.5}
                className="shrink-0"
              />
              <span className="font-medium tracking-wide">{label}</span>
              {active && (
                <span className="ml-auto w-1 h-4 bg-white/40 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5 shrink-0">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3.5 py-2.5 w-full text-sm text-white/30 hover:text-white/60 transition-colors group"
        >
          <LogOut size={15} strokeWidth={1.5} className="shrink-0" />
          <span className="font-medium tracking-wide">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-60 z-30">
        <NavContent />
      </aside>

      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-9 h-9 bg-brand-black text-white flex items-center justify-center shadow-lg"
        aria-label="Open menu"
      >
        <Menu size={17} strokeWidth={1.5} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 left-0 bottom-0 w-60 z-50 lg:hidden"
            >
              <NavContent onClose={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
