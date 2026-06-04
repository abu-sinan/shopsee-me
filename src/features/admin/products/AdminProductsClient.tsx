"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "@/store/toast.store";
import { ProductFormModal } from "@/features/admin/products/ProductFormModal";
import type { Product } from "@/types";

export function AdminProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.name?.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setModalOpen(true); };

  const handleSaved = (saved: Product) => {
    setProducts((prev) => { const exists = prev.find((p) => p.id === saved.id); return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev]; });
    setModalOpen(false);
    toast.success(editing ? "Product updated" : "Product created");
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    startTransition(() => { setProducts((prev) => prev.filter((p) => p.id !== id)); setDeleteId(null); });
    toast.success("Product deleted");
  };

  const toggleFeatured = async (product: Product) => {
    const supabase = createClient();
    const { data } = await supabase.from("products").update({ is_featured: !product.is_featured }).eq("id", product.id).select().single();
    if (data) { setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, is_featured: data.is_featured } : p))); toast.success(data.is_featured ? "Marked as featured" : "Removed from featured"); }
  };

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="w-full pl-9 pr-4 py-2.5 text-sm border border-brand-gray-200 bg-white outline-none focus:border-brand-gray-400 transition-colors" />
          </div>
          <button onClick={openCreate} className="btn-primary gap-2 py-2.5 text-xs whitespace-nowrap"><Plus size={14} strokeWidth={2} />Add Product</button>
        </div>
        <p className="text-xs text-brand-gray-500">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((product, i) => (
              <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: i * 0.03, duration: 0.3 }} className="bg-white border border-brand-gray-200 overflow-hidden group">
                <div className="relative aspect-[4/3] bg-brand-gray-100 overflow-hidden">
                  {product.images[0] ? <Image src={product.images[0].url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageOff size={24} strokeWidth={1} className="text-brand-gray-300" /></div>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(product)} className="w-9 h-9 bg-white flex items-center justify-center text-brand-black hover:bg-brand-gray-100" aria-label="Edit"><Edit2 size={14} strokeWidth={1.5} /></button>
                    <button onClick={() => setDeleteId(product.id)} className="w-9 h-9 bg-white flex items-center justify-center text-red-500 hover:bg-red-50" aria-label="Delete"><Trash2 size={14} strokeWidth={1.5} /></button>
                  </div>
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.is_new && <span className="text-[9px] bg-brand-black text-white font-semibold px-2 py-0.5 tracking-widest uppercase">New</span>}
                    {product.is_featured && <span className="text-[9px] bg-brand-accent text-white font-semibold px-2 py-0.5 tracking-widest uppercase">Featured</span>}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0"><p className="text-sm font-semibold text-brand-black truncate">{product.name}</p><p className="text-xs text-brand-gray-400 mt-0.5">{product.category?.name}</p></div>
                    <p className="text-sm font-bold text-brand-black shrink-0">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {product.variants.slice(0, 4).map((v) => <span key={v.id} className={cn("text-[10px] px-1.5 py-0.5 border font-medium", v.stock === 0 ? "border-red-100 text-red-400 bg-red-50" : "border-brand-gray-200 text-brand-gray-600")}>{v.size}{v.stock === 0 && " (OOS)"}</span>)}
                    {product.variants.length > 4 && <span className="text-[10px] text-brand-gray-400">+{product.variants.length - 4}</span>}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-brand-gray-100">
                    <button onClick={() => toggleFeatured(product)} className={cn("flex items-center gap-1.5 text-[10px] font-medium transition-colors tracking-wide", product.is_featured ? "text-brand-accent hover:text-brand-gray-600" : "text-brand-gray-400 hover:text-brand-black")}>
                      {product.is_featured ? <><Eye size={11} strokeWidth={1.5} />Featured</> : <><EyeOff size={11} strokeWidth={1.5} />Set Featured</>}
                    </button>
                    <button onClick={() => openEdit(product)} className="text-[10px] font-medium text-brand-gray-500 hover:text-brand-black underline underline-offset-2">Edit</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {filtered.length === 0 && <div className="bg-white border border-brand-gray-200 py-20 text-center"><p className="text-brand-gray-500 text-sm">No products found</p></div>}
      </div>
      <AnimatePresence>{modalOpen && <ProductFormModal product={editing} onSaved={handleSaved} onClose={() => setModalOpen(false)} />}</AnimatePresence>
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()} className="bg-white p-6 max-w-sm w-full shadow-xl">
              <h3 className="font-display font-semibold text-lg text-brand-black mb-2">Delete Product?</h3>
              <p className="text-sm text-brand-gray-500 mb-6">This will permanently delete the product and all its images and variants. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline py-2.5 text-xs">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
