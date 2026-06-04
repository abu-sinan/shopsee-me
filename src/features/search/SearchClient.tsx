"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";

const TRENDING = ["Oversized T-Shirt", "Summer Dress", "Linen Shirt", "Hoodie", "Ethnic Wear", "Cotton Pants"];
const STORAGE_KEY = "shopsee-recent-searches";

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}
function saveSearch(query: string) {
  const updated = [query, ...getRecentSearches().filter((s) => s !== query)].slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { setRecent(getRecentSearches()); inputRef.current?.focus(); }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("products").select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`).limit(24);
    setResults((data ?? []) as Product[]);
    setLoading(false); setSearched(true);
    saveSearch(q.trim()); setRecent(getRecentSearches());
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) debounceRef.current = setTimeout(() => doSearch(query), 400);
    else { setResults([]); setSearched(false); }
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.replace(query.trim() ? `/search?${params.toString()}` : "/search", { scroll: false });
  }, [query, router]);

  useEffect(() => { if (initialQ) doSearch(initialQ); }, []); // eslint-disable-line

  return (
    <div className="min-h-screen">
      <div className="sticky top-[calc(2.5rem+4rem)] z-30 bg-brand-white/95 backdrop-blur-md border-b border-brand-gray-100 px-4 py-4">
        <div className="container-brand max-w-2xl mx-auto">
          <div className="relative">
            <Search size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <input ref={inputRef} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, categories…" autoComplete="off" spellCheck={false}
              className="w-full pl-11 pr-12 py-3.5 text-sm md:text-base text-brand-black bg-brand-gray-50 border border-brand-gray-200 outline-none focus:border-brand-gray-400 focus:bg-white transition-all" />
            {query && <button type="button" onClick={() => { setQuery(""); setResults([]); setSearched(false); inputRef.current?.focus(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-black"><X size={16} strokeWidth={1.5} /></button>}
          </div>
        </div>
      </div>
      <div className="container-brand max-w-5xl mx-auto py-8 px-4">
        <AnimatePresence mode="wait">
          {!loading && !searched && query.length < 2 && (
            <motion.div key="suggestions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4"><Clock size={14} strokeWidth={1.5} className="text-brand-gray-400" /><h2 className="label-caps">Recent Searches</h2></div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <div key={term} className="flex items-center border border-brand-gray-200 group">
                        <button onClick={() => setQuery(term)} className="px-3.5 py-2 text-sm text-brand-gray-600 hover:text-brand-black">{term}</button>
                        <button onClick={() => { const u = getRecentSearches().filter((s) => s !== term); localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); setRecent(u); }} className="px-2 py-2 text-brand-gray-300 hover:text-brand-black opacity-0 group-hover:opacity-100"><X size={11} strokeWidth={2} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-4"><TrendingUp size={14} strokeWidth={1.5} className="text-brand-gray-400" /><h2 className="label-caps">Trending Now</h2></div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((term) => <button key={term} onClick={() => setQuery(term)} className="px-4 py-2 text-sm border border-brand-gray-200 text-brand-gray-600 hover:border-brand-black hover:text-brand-black transition-all">{term}</button>)}
                </div>
              </div>
            </motion.div>
          )}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-brand-gray-100 mb-3" /><div className="h-4 bg-brand-gray-100 rounded w-3/4 mb-2" /><div className="h-3 bg-brand-gray-100 rounded w-1/3" /></div>)}
            </motion.div>
          )}
          {searched && !loading && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <p className="text-sm text-brand-gray-600 mb-6">
                {results.length > 0 ? <><span className="font-semibold text-brand-black">{results.length}</span> results for <span className="font-semibold text-brand-black">&quot;{query}&quot;</span></> : <>No results for <span className="font-semibold">&quot;{query}&quot;</span></>}
              </p>
              {results.length === 0 ? (
                <div className="py-20 text-center">
                  <Search size={40} strokeWidth={1} className="text-brand-gray-200 mx-auto mb-4" />
                  <h2 className="font-display font-semibold text-xl text-brand-gray-700 mb-2">No products found</h2>
                  <p className="text-sm text-brand-gray-400 mb-6 max-w-xs mx-auto">Try a different search term or browse our categories.</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {TRENDING.slice(0, 4).map((term) => <button key={term} onClick={() => setQuery(term)} className="px-4 py-2 text-sm border border-brand-gray-200 text-brand-gray-600 hover:border-brand-black hover:text-brand-black transition-all">{term}</button>)}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
                  {results.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
