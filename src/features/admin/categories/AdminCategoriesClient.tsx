"use client";
// @ts-nocheck
import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit2, Trash2, X, Tags, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify, cn } from "@/lib/utils";
import { toast } from "@/store/toast.store";
import type { Category } from "@/types";

const categorySchema = z.object({ name: z.string().min(2), slug: z.string().min(2), description: z.string().optional(), image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")), parent_id: z.string().optional() });
type CFV = z.infer<typeof categorySchema>;

export function AdminCategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!editing;
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<CFV>({ resolver: zodResolver(categorySchema) });

  const openCreate = () => { reset({ name: "", slug: "", description: "", image_url: "", parent_id: "" }); setEditing(null); setServerError(null); setModalOpen(true); };
  const openEdit = (cat: Category) => { reset({ name: cat.name, slug: cat.slug, description: cat.description ?? "", image_url: cat.image_url ?? "", parent_id: cat.parent_id ?? "" }); setEditing(cat); setServerError(null); setModalOpen(true); };

  const onSubmit = async (data: CFV) => {
    setServerError(null);
    const supabase = createClient();
    const payload = { name: data.name, slug: data.slug, description: data.description || null, image_url: data.image_url || null, parent_id: data.parent_id || null };
    if (isEdit) {
      const { data: updated, error } = await supabase.from("categories").update(payload).eq("id", editing!.id).select().single();
      if (error) { setServerError(error.message); return; }
      setCategories((prev) => prev.map((c) => (c.id === editing!.id ? (updated as Category) : c)));
      toast.success("Category updated");
    } else {
      const { data: created, error } = await supabase.from("categories").insert(payload).select().single();
      if (error) { setServerError(error.message); return; }
      setCategories((prev) => [...prev, created as Category]);
      toast.success("Category created");
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const supabase = createClient();
    const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", deleteTarget.id);
    if (count && count > 0) { toast.error("Cannot delete", `${count} product${count !== 1 ? "s" : ""} use this category.`); setDeleteTarget(null); return; }
    await supabase.from("categories").delete().eq("id", deleteTarget.id);
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    toast.success("Category deleted"); setDeleteTarget(null);
  };

  const parentCategories = categories.filter((c) => !c.parent_id && c.id !== editing?.id);
  const fi = (hasError: boolean) => cn("w-full px-3 py-2.5 text-sm bg-white border outline-none transition-colors", hasError ? "border-red-300 focus:border-red-400" : "border-brand-gray-200 focus:border-brand-gray-400");

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-brand-gray-500">{categories.length} categor{categories.length !== 1 ? "ies" : "y"}</p>
          <button onClick={openCreate} className="btn-primary gap-2 py-2.5 text-xs"><Plus size={14} strokeWidth={2} />Add Category</button>
        </div>
        <div className="bg-white border border-brand-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-brand-gray-100">{["Category","Slug","Parent","Actions"].map((h) => <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold tracking-widest uppercase text-brand-gray-400">{h}</th>)}</tr></thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-16 text-center text-sm text-brand-gray-400"><Tags size={28} strokeWidth={1} className="mx-auto mb-2 text-brand-gray-200" />No categories yet.</td></tr>
              ) : categories.map((cat) => {
                const parent = categories.find((c) => c.id === cat.parent_id);
                return (
                  <tr key={cat.id} className="border-b border-brand-gray-50 hover:bg-brand-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-gray-100 overflow-hidden shrink-0">
                          {cat.image_url ? <Image src={cat.image_url} alt={cat.name} width={40} height={40} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageOff size={14} strokeWidth={1} className="text-brand-gray-300" /></div>}
                        </div>
                        <div><p className="font-medium text-brand-black">{cat.name}</p>{cat.description && <p className="text-xs text-brand-gray-400 truncate max-w-[200px]">{cat.description}</p>}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><code className="text-xs bg-brand-gray-100 px-2 py-0.5 text-brand-gray-600">/{cat.slug}</code></td>
                    <td className="px-5 py-3.5 text-xs text-brand-gray-500">{parent?.name ?? <span className="text-brand-gray-300">—</span>}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(cat)} className="p-1.5 text-brand-gray-400 hover:text-brand-black transition-colors"><Edit2 size={13} strokeWidth={1.5} /></button>
                        <button onClick={() => setDeleteTarget(cat)} className="p-1.5 text-brand-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} strokeWidth={1.5} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} transition={{ duration: 0.25 }} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-brand-gray-100">
                <h2 className="font-display font-semibold text-lg">{isEdit ? "Edit Category" : "New Category"}</h2>
                <button onClick={() => setModalOpen(false)} className="p-1 text-brand-gray-400 hover:text-brand-black"><X size={18} strokeWidth={1.5} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-4">
                {serverError && <p className="p-3 bg-red-50 border border-red-200 text-sm text-red-600">{serverError}</p>}
                <div>
                  <label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Category Name *</label>
                  <input
                    {...register("name", {
                      onChange: (e) => { if (!isEdit) setValue("slug", slugify(e.target.value)); }
                    })}
                    type="text"
                    className={fi(!!errors.name?.message)}
                  />
                  {errors.name?.message && <p className="mt-1 text-[11px] text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-gray-600 mb-1.5">URL Slug *</label>
                  <input {...register("slug")} type="text" className={fi(!!errors.slug?.message)} />
                  {errors.slug?.message && <p className="mt-1 text-[11px] text-red-500">{errors.slug.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Description</label>
                  <input {...register("description")} type="text" className={fi(false)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Cover Image URL</label>
                  <input {...register("image_url")} type="url" className={fi(!!errors.image_url?.message)} />
                  {errors.image_url?.message && <p className="mt-1 text-[11px] text-red-500">{errors.image_url.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Parent Category</label>
                  <ParentCategorySelect
                    value={watch("parent_id") ?? ""}
                    onChange={(v) => setValue("parent_id", v)}
                    categories={parentCategories}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-outline py-3 text-xs">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-3 text-xs disabled:opacity-60">{isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
            <motion.div initial={{ scale: 0.94 }} animate={{ scale: 1 }} exit={{ scale: 0.94 }} onClick={(e) => e.stopPropagation()} className="bg-white p-6 max-w-sm w-full shadow-xl">
              <h3 className="font-display font-semibold text-lg text-brand-black mb-2">Delete &ldquo;{deleteTarget.name}&rdquo;?</h3>
              <p className="text-sm text-brand-gray-500 mb-6">Products in this category will become uncategorized. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 btn-outline py-2.5 text-xs">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


/* ── Custom parent category dropdown (no native select) ── */
function ParentCategorySelect({
  value, onChange, categories,
}: {
  value:      string;
  onChange:   (v: string) => void;
  categories: { id: string; name: string }[];
}) {
  const [open, setOpen] = React.useState(false);
  const ref             = React.useRef<HTMLDivElement>(null);
  const selected        = categories.find((c) => c.id === value);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-brand-gray-200 bg-white text-left hover:border-brand-gray-400 transition-colors">
        <span className={selected ? "text-brand-black" : "text-brand-stone"}>
          {selected ? selected.name : "None (top level)"}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={cn("transition-transform shrink-0", open && "rotate-180")}>
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-brand-gray-200 shadow-lg max-h-48 overflow-y-auto mt-1">
          <button type="button" onClick={() => { onChange(""); setOpen(false); }}
            className={cn("w-full text-left px-3 py-2.5 text-sm transition-colors",
              !value ? "bg-brand-black text-white" : "hover:bg-brand-gray-50 text-brand-muted")}>
            None (top level)
          </button>
          {categories.map((cat) => (
            <button key={cat.id} type="button"
              onClick={() => { onChange(cat.id); setOpen(false); }}
              className={cn("w-full text-left px-3 py-2.5 text-sm transition-colors",
                value === cat.id ? "bg-brand-black text-white" : "hover:bg-brand-gray-50 text-brand-dark")}>
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
