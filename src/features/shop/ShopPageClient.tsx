"use client";
// @ts-nocheck
import { useState, useEffect, useCallback, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, LayoutGrid, Grid3X3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard }   from "@/components/product/ProductCard";
import { createClient }  from "@/lib/supabase/client";
import { cn }            from "@/lib/utils";

const SIZES = ["XS","S","M","L","XL","XXL"];

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First"       },
  { value: "price-asc",  label: "Price: Low → High"  },
  { value: "price-desc", label: "Price: High → Low"  },
];

export function ShopPageClient({ categorySlug, subcategorySlug }) {
  const router   = useRouter();
  const pathname = usePathname();
  const sp       = useSearchParams();
  const [, startTransition] = useTransition();

  const [products,   setProducts]  = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [totalCount, setTotal]     = useState(0);
  const [filterOpen, setFilterOpen]= useState(false);
  const [gridCols,   setGridCols]  = useState(4);
  const [pageTitle,  setPageTitle] = useState("All Products");
  const [filters, setFilters] = useState({
    sort:     sp.get("sort") ?? "newest",
    sizes:    sp.getAll("size"),
    minPrice: sp.get("min") ? Number(sp.get("min")) : undefined,
    maxPrice: sp.get("max") ? Number(sp.get("max")) : undefined,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let categoryIds = [];

    if (subcategorySlug) {
      // Specific subcategory slug (e.g. /men/men-tshirts)
      const { data: subCat } = await supabase
        .from("categories")
        .select("id, name")
        .eq("slug", subcategorySlug)
        .single();
      if (subCat) {
        categoryIds = [subCat.id];
        setPageTitle(subCat.name);
      }
    } else if (categorySlug === "new" || categorySlug === "sale") {
      // Special pages — no category filter needed
      setPageTitle(categorySlug === "new" ? "New Arrivals" : "Sale");
    } else if (categorySlug) {
      // Parent category (e.g. /men) — include self + ALL children
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name")
        .eq("slug", categorySlug);

      const parentId = cats?.[0]?.id;
      const parentName = cats?.[0]?.name;
      if (parentId) {
        setPageTitle(parentName ?? categorySlug);

        // Get all children of this parent
        const { data: children } = await supabase
          .from("categories")
          .select("id")
          .eq("parent_id", parentId);

        categoryIds = [parentId, ...(children ?? []).map((c) => c.id)];
      }
    } else {
      setPageTitle("All Products");
    }

    // Build the products query
    let query = supabase
      .from("products")
      .select(
        "*, category:categories(*), images:product_images(*), variants:product_variants(*)",
        { count: "exact" }
      );

    // Category filter
    if (categoryIds.length > 0) {
      query = query.in("category_id", categoryIds);
    }

    // Special flags
    if (categorySlug === "new")  query = query.eq("is_new", true);
    if (categorySlug === "sale") query = query.not("compare_at_price", "is", null);

    // Price filters
    if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
    if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);

    // Sort
    switch (filters.sort) {
      case "price-asc":  query = query.order("price", { ascending: true  }); break;
      case "price-desc": query = query.order("price", { ascending: false }); break;
      default:           query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query.limit(48);
    if (!error && data) { setProducts(data); setTotal(count ?? 0); }
    setLoading(false);
  }, [categorySlug, subcategorySlug, filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilters = (next) => {
    const updated = { ...filters, ...next };
    setFilters(updated);
    const params = new URLSearchParams();
    if (updated.sort !== "newest") params.set("sort", updated.sort);
    updated.sizes?.forEach((s) => params.append("size", s));
    if (updated.minPrice) params.set("min", String(updated.minPrice));
    if (updated.maxPrice) params.set("max", String(updated.maxPrice));
    startTransition(() =>
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    );
  };

  const clearFilters = () =>
    updateFilters({ sizes: [], minPrice: undefined, maxPrice: undefined, sort: "newest" });

  const activeCount = (filters.sizes?.length ?? 0) + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0);

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="border-b border-brand-gray-100 bg-brand-cream/30">
        <div className="container-brand py-10 md:py-14">
          <p className="label-sm mb-2">{subcategorySlug ? "Category" : categorySlug ? "Collection" : "Shop"}</p>
          <h1 className="font-display font-light text-brand-black"
            style={{ fontSize: "clamp(1.75rem, 4vw, 3.5rem)", letterSpacing: "-0.02em" }}>
            {loading ? <span className="opacity-30">&nbsp;</span> : pageTitle}
          </h1>
          {!loading && (
            <p className="text-sm text-brand-stone mt-2">{totalCount} products</p>
          )}
        </div>
      </div>

      <div className="container-brand py-7">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-7 pb-5 border-b border-brand-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 label-md text-brand-ash hover:text-brand-black transition-colors">
              <SlidersHorizontal size={13} strokeWidth={1.5} />
              Filter
              {activeCount > 0 && (
                <span className="w-4 h-4 bg-brand-black text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>
            {filters.sizes?.map((sz) => (
              <button key={sz}
                onClick={() => updateFilters({ sizes: filters.sizes.filter((s) => s !== sz) })}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-black text-white text-[10px] font-medium tracking-wider">
                {sz} <X size={9} strokeWidth={2.5} />
              </button>
            ))}
            {activeCount > 1 && (
              <button onClick={clearFilters}
                className="text-[10px] text-brand-stone hover:text-brand-black underline underline-offset-2">
                Clear all
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Grid toggle */}
            <div className="hidden md:flex items-center border border-brand-gray-200">
              {[4, 3].map((n) => (
                <button key={n} onClick={() => setGridCols(n)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center transition-colors",
                    gridCols === n ? "bg-brand-black text-white" : "text-brand-stone hover:text-brand-black"
                  )}>
                  {n === 4 ? <LayoutGrid size={13} strokeWidth={1.5} /> : <Grid3X3 size={13} strokeWidth={1.5} />}
                </button>
              ))}
            </div>
            {/* Sort */}
            <div className="relative">
              <select value={filters.sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="text-[0.6875rem] font-medium tracking-widest-2 text-brand-ash hover:text-brand-black uppercase bg-transparent border-none outline-none cursor-pointer pr-5 appearance-none">
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={10} strokeWidth={2}
                className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-brand-stone" />
            </div>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className={cn("grid gap-x-3 sm:gap-x-4 gap-y-8",
            gridCols === 4
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3")}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-brand-cream" style={{ aspectRatio: "4/5" }} />
                <div className="h-4 bg-brand-cream rounded mt-3 w-3/4" />
                <div className="h-3 bg-brand-cream rounded mt-2 w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display font-light text-2xl text-brand-dark mb-3">No products found</p>
            <p className="text-sm text-brand-stone mb-6">Try adjusting your filters</p>
            <button onClick={clearFilters} className="btn-outline btn-sm inline-flex">Clear Filters</button>
          </div>
        ) : (
          <motion.div layout
            className={cn("grid gap-x-3 sm:gap-x-4 gap-y-8 md:gap-y-12 lg:gap-y-14",
              gridCols === 4
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3")}>
            <AnimatePresence mode="popLayout">
              {products.map((p, i) => (
                <motion.div key={p.id} layout
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02 }}>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
              onClick={() => setFilterOpen(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[82vw] max-w-[300px] bg-white flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-brand-gray-100 shrink-0">
                <h3 className="font-display font-light text-lg text-brand-black">Filters</h3>
                <button onClick={() => setFilterOpen(false)} className="text-brand-stone hover:text-brand-black">
                  <X size={17} strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
                <div>
                  <p className="label-sm mb-4">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((sz) => (
                      <button key={sz}
                        onClick={() => updateFilters({
                          sizes: filters.sizes?.includes(sz)
                            ? filters.sizes.filter((s) => s !== sz)
                            : [...(filters.sizes ?? []), sz],
                        })}
                        className={cn(
                          "w-11 h-10 text-xs font-medium border transition-all",
                          filters.sizes?.includes(sz)
                            ? "bg-brand-black text-white border-brand-black"
                            : "border-brand-gray-200 text-brand-muted hover:border-brand-stone"
                        )}>
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label-sm mb-4">Price Range (৳)</p>
                  <div className="flex items-center gap-3">
                    <input type="number" placeholder="Min"
                      value={filters.minPrice ?? ""}
                      onChange={(e) => updateFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="input-box flex-1 py-2.5 text-sm" min={0} />
                    <span className="text-brand-stone text-sm">—</span>
                    <input type="number" placeholder="Max"
                      value={filters.maxPrice ?? ""}
                      onChange={(e) => updateFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                      className="input-box flex-1 py-2.5 text-sm" min={0} />
                  </div>
                </div>
              </div>
              <div className="border-t border-brand-gray-100 px-5 py-4 flex gap-3 shrink-0">
                <button onClick={() => { clearFilters(); setFilterOpen(false); }}
                  className="flex-1 btn-outline py-3 text-xs">Clear</button>
                <button onClick={() => setFilterOpen(false)}
                  className="flex-1 btn-primary py-3 text-xs">Apply</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
