"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, LayoutGrid, LayoutList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard }   from "@/components/product/ProductCard";
import { createClient }  from "@/lib/supabase/client";
import { cn }            from "@/lib/utils";
import type { Product, SortOption, FilterState } from "@/types";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest",     label: "Newest First"        },
  { value: "price-asc",  label: "Price: Low to High"  },
  { value: "price-desc", label: "Price: High to Low"  },
  { value: "popular",    label: "Most Popular"         },
];

export function ShopPageClient({
  categorySlug,
  subcategorySlug,
}: {
  categorySlug?:    string;
  subcategorySlug?: string;
}) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [gridCols, setGridCols]     = useState<3 | 4>(4);

  const [filters, setFilters] = useState<FilterState>({
    sort:     (searchParams.get("sort") as SortOption) ?? "newest",
    sizes:    searchParams.getAll("size"),
    minPrice: searchParams.get("min") ? Number(searchParams.get("min")) : undefined,
    maxPrice: searchParams.get("max") ? Number(searchParams.get("max")) : undefined,
  });

  const pageTitle = subcategorySlug
    ? subcategorySlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : categorySlug
    ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)
    : "All Products";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("products")
      .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)", { count: "exact" });

    if (categorySlug && !["new", "sale"].includes(categorySlug))
      query = query.eq("categories.slug", categorySlug);
    if (categorySlug === "new")  query = query.eq("is_new", true);
    if (categorySlug === "sale") query = query.not("compare_at_price", "is", null);
    if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
    if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);

    switch (filters.sort) {
      case "price-asc":  query = query.order("price", { ascending: true  }); break;
      case "price-desc": query = query.order("price", { ascending: false }); break;
      default:           query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query.limit(48);
    if (!error && data) { setProducts(data as Product[]); setTotalCount(count ?? 0); }
    setLoading(false);
  }, [categorySlug, filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilters = (next: Partial<FilterState>) => {
    const updated = { ...filters, ...next };
    setFilters(updated);
    const params = new URLSearchParams();
    if (updated.sort !== "newest") params.set("sort", updated.sort);
    updated.sizes?.forEach((s) => params.append("size", s));
    if (updated.minPrice) params.set("min", String(updated.minPrice));
    if (updated.maxPrice) params.set("max", String(updated.maxPrice));
    startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }));
  };

  const clearFilters = () =>
    updateFilters({ sizes: [], minPrice: undefined, maxPrice: undefined, sort: "newest" });

  const activeCount =
    (filters.sizes?.length ?? 0) + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0);

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b border-brand-gray-100 bg-brand-cream/30">
        <div className="container-brand py-12 md:py-16">
          <p className="label-sm mb-3">
            {categorySlug ? "Collection" : "Shop"}
          </p>
          <h1 className="text-display-lg text-brand-black">{pageTitle}</h1>
          {!loading && (
            <p className="text-sm text-brand-stone mt-2">{totalCount} products</p>
          )}
        </div>
      </div>

      <div className="container-brand py-8 md:py-10">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-brand-gray-100">
          <div className="flex items-center gap-4">
            {/* Filter trigger */}
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 label-md text-brand-ash hover:text-brand-black transition-colors"
            >
              <SlidersHorizontal size={13} strokeWidth={1.5} />
              Filter
              {activeCount > 0 && (
                <span className="w-4 h-4 bg-brand-black text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>

            {/* Active chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {filters.sizes?.map((sz) => (
                <button
                  key={sz}
                  onClick={() => updateFilters({ sizes: filters.sizes?.filter((s) => s !== sz) })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-black text-white text-[10px] font-medium tracking-wider hover:bg-brand-dark transition-colors"
                >
                  {sz} <X size={9} strokeWidth={2.5} />
                </button>
              ))}
              {activeCount > 1 && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] text-brand-stone hover:text-brand-black underline underline-offset-2"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Grid toggle */}
            <div className="hidden md:flex items-center border border-brand-gray-200">
              <button
                onClick={() => setGridCols(4)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center transition-colors",
                  gridCols === 4 ? "bg-brand-black text-white" : "text-brand-stone hover:text-brand-black"
                )}
              >
                <LayoutGrid size={13} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setGridCols(3)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center transition-colors",
                  gridCols === 3 ? "bg-brand-black text-white" : "text-brand-stone hover:text-brand-black"
                )}
              >
                <LayoutList size={13} strokeWidth={1.5} />
              </button>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => updateFilters({ sort: e.target.value as SortOption })}
                className="text-[0.6875rem] font-medium tracking-widest-2 text-brand-ash hover:text-brand-black uppercase bg-transparent border-none outline-none cursor-pointer pr-5 appearance-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={11} strokeWidth={2} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-brand-stone" />
            </div>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className={cn(
            "grid gap-x-4 gap-y-10",
            gridCols === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3"
          )}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-brand-cream" style={{ aspectRatio: "4/5" }} />
                <div className="h-4 bg-brand-cream rounded mt-3 w-3/4" />
                <div className="h-3 bg-brand-cream rounded mt-2 w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-28 text-center">
            <p className="font-display font-light text-2xl text-brand-dark mb-3">No products found</p>
            <p className="text-sm text-brand-stone mb-7">Try adjusting your filters</p>
            <button onClick={clearFilters} className="btn-outline btn-sm inline-flex">
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className={cn(
              "grid gap-x-4 gap-y-10 md:gap-y-14",
              gridCols === 4 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            )}
          >
            <AnimatePresence mode="popLayout">
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.03, duration: 0.4 }}
                >
                  <ProductCard product={p} index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Filter Drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-[320px] bg-brand-white flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-brand-gray-100">
                <h3 className="font-display font-light text-lg text-brand-black">Filters</h3>
                <button onClick={() => setFilterOpen(false)} className="text-brand-stone hover:text-brand-black">
                  <X size={17} strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Size */}
                <div>
                  <p className="label-sm mb-4">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => updateFilters({
                          sizes: filters.sizes?.includes(sz)
                            ? filters.sizes.filter((s) => s !== sz)
                            : [...(filters.sizes ?? []), sz],
                        })}
                        className={cn(
                          "w-11 h-10 text-xs font-medium border transition-all duration-200",
                          filters.sizes?.includes(sz)
                            ? "bg-brand-black text-white border-brand-black"
                            : "border-brand-gray-200 text-brand-muted hover:border-brand-stone"
                        )}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <p className="label-sm mb-4">Price Range (৳)</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice ?? ""}
                      onChange={(e) => updateFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="input-box flex-1 py-2.5"
                      min={0}
                    />
                    <span className="text-brand-stone text-sm">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice ?? ""}
                      onChange={(e) => updateFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="input-box flex-1 py-2.5"
                      min={0}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-brand-gray-100 px-6 py-5 flex gap-3">
                <button onClick={() => { clearFilters(); setFilterOpen(false); }} className="flex-1 btn-outline py-3 text-xs">
                  Clear
                </button>
                <button onClick={() => setFilterOpen(false)} className="flex-1 btn-primary py-3 text-xs">
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
