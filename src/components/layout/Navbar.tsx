"use client";
import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/constants";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import type { NavItem } from "@/types";

interface NavbarProps {
  navItems?: NavItem[];
}

export function Navbar({ navItems }: NavbarProps) {
  const pathname      = usePathname();
  const [scrolled,    setScrolled]    = useState(false);
  const [hidden,      setHidden]      = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [activeMenu,  setActiveMenu]  = useState<string | null>(null);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [query,       setQuery]       = useState("");
  const searchRef     = useRef<HTMLInputElement>(null);
  const prevScrollY   = useRef(0);

  const totalItems       = useCartStore((s) => s.totalItems());
  const openCart         = useCartStore((s) => s.openCart);
  const cartHydrated     = useCartStore((s) => s._hasHydrated);
  const wishlistIds      = useWishlistStore((s) => s.productIds);
  const wishlistHydrated = useWishlistStore((s) => s._hasHydrated);

  const isHome        = pathname === "/";
  const isTransparent = isHome && !scrolled && !activeMenu && !searchOpen;

  // ── Scroll: setScrolled + hide-on-down / show-on-up ──────────────────
  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    setScrolled(currentY > 60);
    // Only hide after scrolling 100px down, don't hide when mobile menu open
    if (!mobileOpen) {
      setHidden(currentY > prevScrollY.current && currentY > 100);
    }
    prevScrollY.current = currentY;
  }, [mobileOpen]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => { setMobileOpen(false); setActiveMenu(null); }, [pathname]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    if (mobileOpen) setHidden(false);
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) { window.location.href = `/search?q=${encodeURIComponent(query.trim())}`; }
  };

  // Use dynamic navItems prop if provided, else fall back to empty
  const NAV = navItems ?? [];

  return (
    <>
      <header
        style={{ height: "var(--nav-height)" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-40 flex items-center transition-all duration-300",
          hidden && "-translate-y-full",
          isTransparent
            ? "bg-transparent border-b border-transparent"
            : "bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm"
        )}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="container-brand w-full flex items-center justify-between gap-4 h-full">

          {/* LEFT — Hamburger (mobile) + Desktop nav */}
          <div className="flex items-center gap-4 lg:gap-6 h-full">
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 -ml-1.5"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={1.5}
                className={isTransparent ? "text-white" : "text-brand-black"} />
            </button>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center h-full gap-0.5">
              {NAV.map((item) => {
                const active  = item.href !== "/" && pathname.startsWith(item.href);
                const hasKids = item.children && item.children.length > 0;
                return (
                  <div
                    key={item.href}
                    className="relative h-full flex items-center"
                    onMouseEnter={() => hasKids ? setActiveMenu(item.label) : setActiveMenu(null)}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 text-[0.6875rem] font-medium tracking-widest-2 uppercase transition-colors duration-200 rounded-sm",
                        isTransparent
                          ? "text-white/80 hover:text-white"
                          : active
                          ? "text-brand-black"
                          : "text-brand-muted hover:text-brand-black"
                      )}
                    >
                      {item.label}
                      {hasKids && (
                        <ChevronDown size={10} strokeWidth={2}
                          className={cn("transition-transform duration-200",
                            activeMenu === item.label && "rotate-180")} />
                      )}
                    </Link>
                    {active && !isTransparent && (
                      <span className="absolute bottom-0 left-3 right-3 h-px bg-brand-black rounded-full" />
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* CENTER — Logo */}
          <Link
            href="/"
            className={cn(
              "absolute left-1/2 -translate-x-1/2 font-display font-light text-xl lg:text-2xl tracking-tight transition-colors duration-300 whitespace-nowrap",
              isTransparent ? "text-white" : "text-brand-black"
            )}
          >
            {SITE_CONFIG.name}
          </Link>

          {/* RIGHT — Icons */}
          <div className="flex items-center gap-0">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className={cn(
                "w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center transition-colors rounded-sm",
                isTransparent ? "text-white/80 hover:text-white" : "text-brand-muted hover:text-brand-black"
              )}
              aria-label="Search"
            >
              <Search size={17} strokeWidth={1.5} />
            </button>

            <Link
              href="/wishlist"
              className={cn(
                "relative w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center transition-colors rounded-sm",
                isTransparent ? "text-white/80 hover:text-white" : "text-brand-muted hover:text-brand-black"
              )}
              aria-label="Wishlist"
            >
              <Heart size={17} strokeWidth={1.5} />
              {wishlistHydrated && wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-brand-accent text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            <button
              onClick={openCart}
              className={cn(
                "relative w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center transition-colors rounded-sm",
                isTransparent ? "text-white/80 hover:text-white" : "text-brand-muted hover:text-brand-black"
              )}
              aria-label="Cart"
            >
              <ShoppingBag size={17} strokeWidth={1.5} />
              {cartHydrated && totalItems > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-brand-black text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none">
                  {totalItems}
                </span>
              )}
            </button>

            <Link
              href="/account"
              className={cn(
                "hidden sm:flex w-9 h-9 lg:w-10 lg:h-10 items-center justify-center transition-colors rounded-sm",
                isTransparent ? "text-white/80 hover:text-white" : "text-brand-muted hover:text-brand-black"
              )}
              aria-label="Account"
            >
              <User size={17} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Desktop mega-menu dropdown */}
        <AnimatePresence>
          {activeMenu && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl"
            >
              <div className="container-brand py-6 lg:py-8">
                <div className="flex flex-wrap gap-x-10 gap-y-2">
                  {NAV.find((n) => n.label === activeMenu)?.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="group py-1"
                      onClick={() => setActiveMenu(null)}
                    >
                      <span className="block text-sm font-medium text-brand-dark group-hover:text-brand-black transition-colors">
                        {child.label}
                      </span>
                      <span className="block h-px w-0 group-hover:w-full bg-brand-accent transition-all duration-300 mt-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute top-full left-0 right-0 overflow-hidden bg-white border-b border-gray-100 shadow-md"
            >
              <form onSubmit={handleSearch} className="container-brand py-3.5 flex items-center gap-3">
                <Search size={15} strokeWidth={1.5} className="text-brand-stone shrink-0" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, categories…"
                  className="flex-1 bg-transparent text-sm text-brand-black placeholder:text-brand-stone outline-none"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setQuery(""); }}
                  className="text-brand-stone hover:text-brand-black"
                  aria-label="Close search"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[82vw] max-w-[320px] bg-white flex flex-col shadow-2xl lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 shrink-0">
                <Link href="/" onClick={() => setMobileOpen(false)}
                  className="font-display font-light text-lg text-brand-black">
                  {SITE_CONFIG.name}
                </Link>
                <button onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-brand-stone hover:text-brand-black" aria-label="Close">
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-5 py-3">
                {NAV.map((item, i) => (
                  <MobileNavItem
                    key={item.href}
                    item={item}
                    index={i}
                    onClose={() => setMobileOpen(false)}
                  />
                ))}
              </nav>

              {/* Bottom links */}
              <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-3.5 shrink-0">
                <Link href="/account" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 text-sm text-brand-muted hover:text-brand-black transition-colors">
                  <User size={15} strokeWidth={1.5} /> My Account
                </Link>
                <Link href="/wishlist" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 text-sm text-brand-muted hover:text-brand-black transition-colors">
                  <Heart size={15} strokeWidth={1.5} /> Wishlist
                  {wishlistHydrated && wishlistIds.length > 0 && (
                    <span className="ml-auto text-xs font-semibold text-brand-accent">{wishlistIds.length}</span>
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

/* ── Mobile Nav Item ── */
function MobileNavItem({
  item, index, onClose,
}: {
  item: NavItem;
  index: number;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
      className="border-b border-gray-100 last:border-0"
    >
      <div className="flex items-center justify-between py-3.5">
        <Link href={item.href} onClick={onClose}
          className="text-[0.9375rem] font-medium text-brand-dark hover:text-brand-black transition-colors">
          {item.label}
        </Link>
        {item.children && (
          <button onClick={() => setOpen((v) => !v)}
            className="p-1.5 text-brand-stone hover:text-brand-black" aria-label="Expand">
            <ChevronDown size={14} strokeWidth={1.5}
              className={cn("transition-transform duration-200", open && "rotate-180")} />
          </button>
        )}
      </div>
      <AnimatePresence>
        {item.children && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-3 pl-3 space-y-0.5">
              {item.children.map((child) => (
                <Link key={child.href} href={child.href} onClick={onClose}
                  className="flex py-2 text-sm text-brand-ash hover:text-brand-black transition-colors">
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
