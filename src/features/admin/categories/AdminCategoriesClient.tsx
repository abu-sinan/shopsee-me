"use client";
// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm }     from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z }           from "zod";
import { Plus, Edit2, Trash2, X, ChevronRight, ChevronDown, FolderOpen, Folder, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify, cn }  from "@/lib/utils";
import { toast }        from "@/store/toast.store";

const CORE_SLUGS = ["men", "women", "kids", "accessories", "sale"];

const schema = z.object({
  name:      z.string().min(2, "Name required"),
  slug:      z.string().min(2, "Slug required"),
  parent_id: z.string().optional(),
});
type FV = z.infer<typeof schema>;

interface Cat {
  id: string; name: string; slug: string;
  parent_id: string | null; image_url?: string | null; description?: string | null;
}

export function AdminCategoriesClient({ initialCategories }: { initialCategories: Cat[] }) {
  const [categories, setCats]       = useState<Cat[]>(initialCategories);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<Cat | null>(null);
  const [deleteTarget, setDelTarget]= useState<Cat | null>(null);
  const [expanded,   setExpanded]   = useState<Set<string>>(new Set(
    // Expand all parent categories by default
    initialCategories.filter((c) => !c.parent_id).map((c) => c.id)
  ));
  const [serverError, setError]     = useState<string | null>(null);
  const isEdit = !!editing;

  const { register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting } } = useForm<FV>({ resolver: zodResolver(schema) });

  const nameVal = watch("name");

  useEffect(() => {
    if (!isEdit && nameVal) setValue("slug", slugify(nameVal));
  }, [nameVal, isEdit, setValue]);

  const openCreate = (parentId?: string) => {
    reset({ name: "", slug: "", parent_id: parentId ?? "" });
    setEditing(null); setError(null); setModalOpen(true);
  };

  const openEdit = (cat: Cat) => {
    reset({ name: cat.name, slug: cat.slug, parent_id: cat.parent_id ?? "" });
    setEditing(cat); setError(null); setModalOpen(true);
  };

  const onSubmit = async (data: FV) => {
    setError(null);
    const supabase = createClient();
    const payload = {
      name:      data.name,
      slug:      data.slug,
      parent_id: data.parent_id || null,
    };

    if (isEdit) {
      const { data: updated, error } = await supabase
        .from("categories").update(payload).eq("id", editing!.id).select().single();
      if (error) { setError(error.message); return; }
      setCats((prev) => prev.map((c) => c.id === editing!.id ? updated as Cat : c));
      toast.success("Category updated");
    } else {
      const { data: created, error } = await supabase
        .from("categories").insert(payload).select().single();
      if (error) { setError(error.message); return; }
      setCats((prev) => [...prev, created as Cat]);
      toast.success("Category created");
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (CORE_SLUGS.includes(deleteTarget.slug)) {
      toast.error("Cannot delete", "Core parent categories are protected.");
      setDelTarget(null); return;
    }
    const supabase = createClient();

    // Check if has products
    const { count: productCount } = await supabase
      .from("products").select("id", { count: "exact", head: true }).eq("category_id", deleteTarget.id);
    if (productCount && productCount > 0) {
      toast.error("Cannot delete", `${productCount} product(s) use this category. Reassign them first.`);
      setDelTarget(null); return;
    }
    // Check if has children
    const { count: childCount } = await supabase
      .from("categories").select("id", { count: "exact", head: true }).eq("parent_id", deleteTarget.id);
    if (childCount && childCount > 0) {
      toast.error("Cannot delete", `Delete all subcategories first.`);
      setDelTarget(null); return;
    }

    await supabase.from("categories").delete().eq("id", deleteTarget.id);
    setCats((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    toast.success("Category deleted"); setDelTarget(null);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Build tree
  const parents  = categories.filter((c) => !c.parent_id);
  const childMap: Record<string, Cat[]> = {};
  categories.filter((c) => c.parent_id).forEach((c) => {
    if (!childMap[c.parent_id!]) childMap[c.parent_id!] = [];
    childMap[c.parent_id!].push(c);
  });

  const fi = (err: boolean) => cn(
    "w-full px-3 py-2.5 text-sm bg-white border outline-none transition-colors",
    err ? "border-red-300" : "border-brand-gray-200 focus:border-brand-gray-500"
  );

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-brand-stone">
            {parents.length} parent · {categories.filter((c) => c.parent_id).length} child categories
          </p>
          <button onClick={() => openCreate()}
            className="btn-primary gap-2 py-2.5 text-xs">
            <Plus size={14} strokeWidth={2} />Add Category
          </button>
        </div>

        {/* Category tree */}
        <div className="space-y-2">
          {parents.map((parent) => {
            const children  = childMap[parent.id] ?? [];
            const isCore    = CORE_SLUGS.includes(parent.slug);
            const isExpanded = expanded.has(parent.id);

            return (
              <div key={parent.id} className="bg-white border border-brand-gray-200 overflow-hidden">
                {/* Parent row */}
                <div className="flex items-center gap-2 px-4 py-3.5 bg-brand-cream/30">
                  <button onClick={() => children.length > 0 && toggleExpand(parent.id)}
                    className={cn("text-brand-stone transition-transform duration-200 shrink-0",
                      children.length === 0 && "opacity-30 cursor-default")}>
                    {children.length > 0
                      ? isExpanded ? <ChevronDown size={15} strokeWidth={1.5} /> : <ChevronRight size={15} strokeWidth={1.5} />
                      : <ChevronRight size={15} strokeWidth={1.5} />}
                  </button>

                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    {isExpanded
                      ? <FolderOpen size={15} strokeWidth={1.5} className="text-brand-accent shrink-0" />
                      : <Folder size={15} strokeWidth={1.5} className="text-brand-accent shrink-0" />}
                    <span className="font-semibold text-sm text-brand-dark">{parent.name}</span>
                    <code className="text-[10px] bg-brand-gray-100 px-1.5 py-0.5 text-brand-stone">/{parent.slug}</code>
                    {isCore && (
                      <span className="flex items-center gap-1 text-[9px] font-medium text-brand-stone bg-brand-gray-100 px-1.5 py-0.5">
                        <Lock size={8} strokeWidth={2} />CORE
                      </span>
                    )}
                    <span className="text-[10px] text-brand-stone ml-1">
                      {children.length} sub{children.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Add child button */}
                    <button onClick={() => openCreate(parent.id)}
                      className="h-7 px-2.5 flex items-center gap-1 text-[10px] font-medium text-brand-black border border-brand-gray-200 hover:bg-brand-black hover:text-white transition-all">
                      <Plus size={10} strokeWidth={2} />Add Sub
                    </button>
                    <button onClick={() => openEdit(parent)}
                      className="w-7 h-7 flex items-center justify-center text-brand-stone hover:text-brand-black transition-colors">
                      <Edit2 size={13} strokeWidth={1.5} />
                    </button>
                    {!isCore && (
                      <button onClick={() => setDelTarget(parent)}
                        className="w-7 h-7 flex items-center justify-center text-brand-stone hover:text-red-500 transition-colors">
                        <Trash2 size={13} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Children */}
                <AnimatePresence initial={false}>
                  {isExpanded && children.length > 0 && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="border-t border-brand-gray-100">
                        {children.map((child, idx) => (
                          <div key={child.id}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 border-b border-brand-gray-50 last:border-0",
                              "hover:bg-brand-gray-50 transition-colors"
                            )}>
                            <div className="w-4 shrink-0" />
                            <div className="w-px h-4 bg-brand-gray-200 shrink-0" />
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <span className="text-sm text-brand-dark">{child.name}</span>
                              <code className="text-[10px] bg-brand-gray-100 px-1.5 py-0.5 text-brand-stone">/{child.slug}</code>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => openEdit(child)}
                                className="w-7 h-7 flex items-center justify-center text-brand-stone hover:text-brand-black">
                                <Edit2 size={12} strokeWidth={1.5} />
                              </button>
                              <button onClick={() => setDelTarget(child)}
                                className="w-7 h-7 flex items-center justify-center text-brand-stone hover:text-red-500">
                                <Trash2 size={12} strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty state */}
                {isExpanded && children.length === 0 && (
                  <div className="border-t border-brand-gray-100 px-5 py-3 flex items-center gap-2">
                    <div className="w-4" />
                    <span className="text-xs text-brand-stone italic">No subcategories yet</span>
                    <button onClick={() => openCreate(parent.id)}
                      className="ml-auto text-[10px] text-brand-black underline underline-offset-2 hover:opacity-70">
                      + Add first subcategory
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}>
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-brand-gray-100">
                <h2 className="font-display font-light text-xl text-brand-black">
                  {isEdit ? `Edit "${editing!.name}"` : "New Category"}
                </h2>
                <button onClick={() => setModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-brand-stone hover:text-brand-black">
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-5 space-y-4">
                {serverError && (
                  <p className="p-3 bg-red-50 border border-red-200 text-sm text-red-600 rounded">{serverError}</p>
                )}

                <div>
                  <label className="block text-xs font-medium text-brand-stone mb-1.5">Category Name *</label>
                  <input {...register("name", {
                    onChange: (e) => { if (!isEdit) setValue("slug", slugify(e.target.value)); }
                  })} placeholder="e.g. T-Shirts" className={fi(!!errors.name)} />
                  {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-brand-stone mb-1.5">URL Slug *</label>
                  <input {...register("slug")} placeholder="e.g. men-tshirts" className={fi(!!errors.slug)} />
                  <p className="mt-1 text-[10px] text-brand-stone">Used in URL: /men/men-tshirts</p>
                  {errors.slug && <p className="mt-1 text-[11px] text-red-500">{errors.slug.message}</p>}
                </div>

                {/* Parent category selector */}
                <div>
                  <label className="block text-xs font-medium text-brand-stone mb-1.5">Parent Category</label>
                  <ParentSelect
                    value={watch("parent_id") ?? ""}
                    onChange={(v) => setValue("parent_id", v)}
                    parents={parents}
                    excludeId={editing?.id}
                  />
                  <p className="mt-1 text-[10px] text-brand-stone">
                    Leave empty to create a top-level category
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)}
                    className="flex-1 btn-outline py-3 text-xs">Cancel</button>
                  <button type="submit" disabled={isSubmitting}
                    className="flex-1 btn-primary py-3 text-xs disabled:opacity-60">
                    {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDelTarget(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 max-w-sm w-full shadow-xl">
              <h3 className="font-display font-light text-xl text-brand-black mb-2">
                Delete &ldquo;{deleteTarget.name}&rdquo;?
              </h3>
              <p className="text-sm text-brand-stone mb-6">
                This will permanently remove the category. Products must be reassigned first.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDelTarget(null)} className="flex-1 btn-outline py-2.5 text-xs">Cancel</button>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Custom parent dropdown ── */
function ParentSelect({ value, onChange, parents, excludeId }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const selected = parents.find((p) => p.id === value);

  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-brand-gray-200 bg-white text-left hover:border-brand-gray-400 transition-colors">
        <span className={selected ? "text-brand-black" : "text-brand-stone"}>
          {selected ? selected.name : "None (top-level category)"}
        </span>
        <ChevronDown size={12} strokeWidth={1.5}
          className={cn("shrink-0 transition-transform text-brand-stone", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 bg-white border border-brand-gray-200 shadow-lg max-h-52 overflow-y-auto mt-1">
            <button type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className={cn("w-full text-left px-3 py-2.5 text-sm transition-colors",
                !value ? "bg-brand-black text-white" : "hover:bg-brand-gray-50 text-brand-stone italic")}>
              None (top-level)
            </button>
            {parents.filter((p) => p.id !== excludeId).map((p) => (
              <button key={p.id} type="button"
                onClick={() => { onChange(p.id); setOpen(false); }}
                className={cn("w-full text-left px-3 py-2.5 text-sm transition-colors",
                  value === p.id ? "bg-brand-black text-white" : "hover:bg-brand-gray-50 text-brand-dark")}>
                {p.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
