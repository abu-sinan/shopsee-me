"use client";

import { useState, useEffect, useRef } from "react";
import Link         from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingBag, Heart, User,
  Menu, X, ChevronDown, ArrowRight,
} from "lucide-react";
import { cn }            from "@/lib/utils";
import { NAV_ITEMS, SITE_CONFIG } from "@/constants";
import { useCartStore }  from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import type { NavItem }  from "@/types";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenu, setMegaMenu]     = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]           = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const totalItems      = useCartStore((s) => s.totalItems());
  const openCart        = useCartStore((s) => s.openCart);
  const cartHydrated    = useCartStore((s) => s._hasHydrated);
  const wishlistIds     = useWishlistStore((s) => s.productIds);
  const wishlistHydrated = useWishlistStore((s) => s._hasHydrated);

  const isHome = pathname === "/";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setMegaMenu(null); }, [pathname]);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
  };

  const transparent = isHome && !scrolled && !megaMenu && !searchOpen;

  return (
    <>
      {/* Announcement bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-brand-black text-brand-white h-9 flex items-center justify-center">
        <p className="label-xs text-white/70 tracking-widest-4">
          Free delivery in Dhaka on orders over ৳1,500 — New Season Now Live
        </p>
      </div>

      {/* Main nav */}
      <header
        className={cn(
          "fixed top-9 left-0 right-0 z-40 h-14 transition-all duration-500",
          transparent
            ? "bg-transparent border-b border-transparent"
            : "bg-brand-white/95 backdrop-blur-xl border-b border-brand-gray-100"
        )}
        onMouseLeave={() => setMegaMenu(null)}
      >
        <div className="container-brand h-full flex items-center justify-between gap-6">

          {/* Left — Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7 h-full">
            {NAV_ITEMS.map((item) => (
              <DesktopNavItem
                key={item.href}
                item={item}
                transparent={transparent}
                active={megaMenu === item.label}
                onEnter={() => item.children && setMegaMenu(item.label)}
                pathname={pathname}
              />
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={1.5} className={transparent ? "text-white" : "text-brand-black"} />
          </button>

          {/* Center — Logo */}
          <Link
            href="/"
            className={cn(
              "absolute left-1/2 -translate-x-1/2",
              "font-display font-light text-2xl md:text-3xl tracking-tight",
              "transition-colors duration-300",
              transparent ? "text-white" : "text-brand-black",
              "hover:opacity-70"
            )}
          >
            {SITE_CONFIG.name}
          </Link>

          {/* Right — Icons */}
          <div className="flex items-center gap-0.5">
            {/* Search */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className={cn(
                "w-10 h-10 flex items-center justify-center transition-colors duration-200",
                transparent ? "text-white/80 hover:text-white" : "text-brand-muted hover:text-brand-black"
              )}
              aria-label="Search"
            >
              <Search size={17} strokeWidth={1.5} />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className={cn(
                "relative w-10 h-10 flex items-center justify-center transition-colors",
                transparent ? "text-white/80 hover:text-white" : "text-brand-muted hover:text-brand-black"
              )}
              aria-label="Wishlist"
            >
              <Heart size={17} strokeWidth={1.5} />
              {wishlistHydrated && wishlistIds.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-brand-accent text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className={cn(
                "relative w-10 h-10 flex items-center justify-center transition-colors",
                transparent ? "text-white/80 hover:text-white" : "text-brand-muted hover:text-brand-black"
              )}
              aria-label="Cart"
            >
              <ShoppingBag size={17} strokeWidth={1.5} />
              {cartHydrated && totalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-brand-black text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Account */}
            <Link
              href="/account"
              className={cn(
                "hidden md:flex w-10 h-10 items-center justify-center transition-colors",
                transparent ? "text-white/80 hover:text-white" : "text-brand-muted hover:text-brand-black"
              )}
              aria-label="Account"
            >
              <User size={17} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {megaMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{   opacity: 0, y: -8  }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 bg-brand-white border-b border-brand-gray-100 shadow-xl"
            >
              <div className="container-brand py-10">
                <div className="grid grid-cols-4 gap-8">
                  {NAV_ITEMS.find((n) => n.label === megaMenu)?.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="group flex flex-col gap-2"
                    >
                      <span className="label-md group-hover:text-brand-black transition-colors">
                        {child.label}
                      </span>
                      <span className="w-0 group-hover:w-8 h-px bg-brand-accent transition-all duration-300" />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-brand-white border-b border-brand-gray-100"
            >
              <form onSubmit={handleSearch} className="container-brand py-5 flex items-center gap-4">
                <Search size={15} strokeWidth={1.5} className="text-brand-stone shrink-0" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products, categories…"
                  className="flex-1 bg-transparent text-sm text-brand-black placeholder:text-brand-stone outline-none"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setQuery(""); }}
                  className="text-brand-stone hover:text-brand-black transition-colors"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[88vw] max-w-[360px] bg-brand-white flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-brand-gray-100">
                <Link href="/" className="font-display font-light text-2xl text-brand-black">
                  {SITE_CONFIG.name}
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-brand-ash"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-0">
                {NAV_ITEMS.map((item, i) => (
                  <MobileNavItem key={item.href} item={item} index={i} />
                ))}
              </nav>

              <div className="border-t border-brand-gray-100 px-6 py-5 space-y-3">
                <Link href="/account" className="flex items-center gap-3 text-sm text-brand-muted hover:text-brand-black transition-colors">
                  <User size={15} strokeWidth={1.5} />Account
                </Link>
                <Link href="/wishlist" className="flex items-center gap-3 text-sm text-brand-muted hover:text-brand-black transition-colors">
                  <Heart size={15} strokeWidth={1.5} />Wishlist
                  {wishlistHydrated && wishlistIds.length > 0 && (
                    <span className="ml-auto text-xs font-medium text-brand-accent">{wishlistIds.length}</span>
                  )}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Desktop Nav Item ── */
function DesktopNavItem({ item, transparent, active, onEnter, pathname }: {
  item: NavItem; transparent: boolean; active: boolean;
  onEnter: () => void; pathname: string;
}) {
  const current = pathname.startsWith(item.href) && item.href !== "/";
  return (
    <div className="relative flex items-center h-full" onMouseEnter={onEnter}>
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-1 link-nav transition-colors",
          transparent ? "text-white/80 hover:text-white" : "",
          current && !transparent ? "text-brand-black" : ""
        )}
      >
        {item.label}
        {item.children && (
          <ChevronDown
            size={11}
            strokeWidth={2}
            className={cn("transition-transform duration-200", active && "rotate-180")}
          />
        )}
      </Link>
      {current && (
        <span className="absolute bottom-0 left-0 right-0 h-px bg-brand-black" />
      )}
    </div>
  );
}

/* ── Mobile Nav Item ── */
function MobileNavItem({ item, index }: { item: NavItem; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0   }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="border-b border-brand-gray-100 last:border-0"
    >
      <div className="flex items-center justify-between py-4">
        <Link href={item.href} className="text-base font-medium text-brand-dark tracking-wide">
          {item.label}
        </Link>
        {item.children && (
          <button onClick={() => setOpen((v) => !v)} className="p-1 text-brand-stone">
            <ChevronDown size={14} strokeWidth={1.5} className={cn("transition-transform duration-200", open && "rotate-180")} />
          </button>
        )}
      </div>
      <AnimatePresence>
        {item.children && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-4 pl-4 flex flex-col gap-1">
              {item.children.map((child) => (
                <Link key={child.href} href={child.href} className="flex items-center gap-2 py-2 text-sm text-brand-ash hover:text-brand-black transition-colors group">
                  <ArrowRight size={11} strokeWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  {child.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
