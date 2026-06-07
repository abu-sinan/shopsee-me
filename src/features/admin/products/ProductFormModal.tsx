"use client";
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }     from "framer-motion";
import { useForm, useFieldArray }      from "react-hook-form";
import { zodResolver }                 from "@hookform/resolvers/zod";
import { z }                           from "zod";
import { X, Plus, Trash2, ChevronDown, Check, ChevronRight } from "lucide-react";
import { createClient }  from "@/lib/supabase/client";
import { slugify, cn }   from "@/lib/utils";

const variantSchema = z.object({
  id:    z.string().optional(),
  size:  z.string().min(1, "Required"),
  color: z.string().optional(),
  stock: z.coerce.number().min(0),
  sku:   z.string().min(1, "Required"),
});

const productSchema = z.object({
  name:             z.string().min(2, "Name required"),
  slug:             z.string().min(2, "Slug required"),
  description:      z.string().min(5, "Description required"),
  price:            z.coerce.number().min(1, "Price required"),
  compare_at_price: z.coerce.number().optional(),
  category_id:      z.string().min(1, "Category required"),
  is_new:           z.boolean(),
  is_featured:      z.boolean(),
  tags:             z.string(),
  variants:         z.array(variantSchema).min(1, "At least one variant required"),
});

type PFV = z.infer<typeof productSchema>;

interface Category { id: string; name: string; slug: string; parent_id: string | null; }

export function ProductFormModal({ product, onSaved, onClose }) {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [catOpen,    setCatOpen]    = useState(false);
  const [catSearch,  setCatSearch]  = useState("");
  const [serverError, setError]     = useState(null);
  const catRef = useRef(null);
  const isEdit = !!product;

  const {
    register, handleSubmit, watch, setValue, control,
    formState: { errors, isSubmitting },
  } = useForm<PFV>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name:             product?.name             ?? "",
      slug:             product?.slug             ?? "",
      description:      product?.description      ?? "",
      price:            product?.price            ?? 0,
      compare_at_price: product?.compare_at_price ?? undefined,
      category_id:      product?.category_id      ?? "",
      is_new:           product?.is_new           ?? false,
      is_featured:      product?.is_featured      ?? false,
      tags:             product?.tags?.join(", ") ?? "",
      variants: product?.variants?.length
        ? product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color ?? "", stock: v.stock, sku: v.sku }))
        : [{ size: "M", color: "", stock: 10, sku: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const nameValue  = watch("name");
  const categoryId = watch("category_id");

  // Auto-slug
  useEffect(() => {
    if (!isEdit && nameValue) setValue("slug", slugify(nameValue));
  }, [nameValue, isEdit, setValue]);

  // Load categories
  useEffect(() => {
    createClient().from("categories").select("id,name,slug,parent_id").order("name")
      .then(({ data }) => setAllCategories((data ?? []) as Category[]));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Build category display
  const parents  = allCategories.filter((c) => !c.parent_id);
  const childMap = {};
  allCategories.filter((c) => c.parent_id).forEach((c) => {
    if (!childMap[c.parent_id]) childMap[c.parent_id] = [];
    childMap[c.parent_id].push(c);
  });

  const selectedCat    = allCategories.find((c) => c.id === categoryId);
  const selectedParent = selectedCat?.parent_id
    ? allCategories.find((c) => c.id === selectedCat.parent_id)
    : null;

  const displayLabel = selectedCat
    ? selectedParent
      ? `${selectedParent.name} → ${selectedCat.name}`
      : selectedCat.name
    : "Select category…";

  const onSubmit = async (data: PFV) => {
    setError(null);
    const supabase = createClient();
    const payload = {
      name:             data.name,
      slug:             data.slug,
      description:      data.description,
      price:            data.price,
      compare_at_price: data.compare_at_price || null,
      category_id:      data.category_id,
      is_new:           data.is_new,
      is_featured:      data.is_featured,
      tags:             data.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    let savedId;
    if (isEdit) {
      const { data: u, error } = await supabase.from("products").update(payload).eq("id", product.id).select("id").single();
      if (error) { setError(error.message); return; }
      savedId = u.id;
    } else {
      const { data: c, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error) { setError(error.message); return; }
      savedId = c.id;
    }

    const varPayload = data.variants.map((v) => ({
      ...(v.id ? { id: v.id } : {}),
      product_id: savedId, size: v.size, color: v.color || null,
      stock: v.stock, sku: v.sku || `SSM-${slugify(data.name).toUpperCase().slice(0,6)}-${v.size}`,
    }));

    if (isEdit) {
      const toDelete = product.variants.map((v) => v.id).filter((id) => !data.variants.map((v) => v.id).includes(id));
      if (toDelete.length) await supabase.from("product_variants").delete().in("id", toDelete);
    }
    await supabase.from("product_variants").upsert(varPayload, { onConflict: "id" });

    const { data: final } = await supabase
      .from("products")
      .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
      .eq("id", savedId).single();
    if (final) onSaved(final);
  };

  const fi = (err) => cn(
    "w-full px-3 py-2.5 text-sm bg-white border outline-none transition-colors",
    err ? "border-red-300" : "border-brand-gray-200 focus:border-brand-gray-500"
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-2xl flex flex-col shadow-2xl"
        style={{ maxHeight: "94dvh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-gray-100 shrink-0">
          <h2 className="font-display font-light text-xl text-brand-black">
            {isEdit ? "Edit Product" : "New Product"}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-brand-stone hover:text-brand-black">
            <X size={17} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {serverError && (
            <p className="p-3 bg-red-50 border border-red-200 text-sm text-red-600">{serverError}</p>
          )}

          {/* Name + Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-stone mb-1.5">Product Name *</label>
              <input {...register("name")} placeholder="e.g. Oversized Black Tee" className={fi(!!errors.name)} />
              {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-stone mb-1.5">URL Slug *</label>
              <input {...register("slug")} className={fi(!!errors.slug)} />
              {errors.slug && <p className="mt-1 text-[11px] text-red-500">{errors.slug.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-brand-stone mb-1.5">Description *</label>
            <textarea {...register("description")} rows={3}
              className={cn(fi(!!errors.description), "resize-none")} />
            {errors.description && <p className="mt-1 text-[11px] text-red-500">{errors.description.message}</p>}
          </div>

          {/* Price + Compare */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-stone mb-1.5">Price (৳) *</label>
              <input {...register("price")} type="number" min={0} placeholder="1200" className={fi(!!errors.price)} />
              {errors.price && <p className="mt-1 text-[11px] text-red-500">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-stone mb-1.5">Compare Price (৳)</label>
              <input {...register("compare_at_price")} type="number" min={0} placeholder="1500" className={fi(false)} />
              <p className="mt-1 text-[10px] text-brand-stone">Shows as original/crossed-out price</p>
            </div>
          </div>

          {/* Category — tree picker */}
          <div ref={catRef} className="relative">
            <label className="block text-xs font-medium text-brand-stone mb-1.5">
              Category *
              <span className="ml-1 text-brand-stone font-normal normal-case tracking-normal">
                — select the specific subcategory (e.g. Men → T-Shirts)
              </span>
            </label>
            <input type="hidden" {...register("category_id")} />
            <button type="button" onClick={() => { setCatOpen((v) => !v); setCatSearch(""); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 text-sm border text-left transition-colors",
                errors.category_id ? "border-red-300" : "border-brand-gray-200 hover:border-brand-gray-400"
              )}>
              <span className={categoryId ? "text-brand-black" : "text-brand-stone"}>
                {displayLabel}
              </span>
              <ChevronDown size={13} strokeWidth={1.5}
                className={cn("shrink-0 text-brand-stone transition-transform", catOpen && "rotate-180")} />
            </button>
            {errors.category_id && <p className="mt-1 text-[11px] text-red-500">Please select a category</p>}

            {/* Tree dropdown */}
            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 z-[60] bg-white border border-brand-gray-200 shadow-xl mt-1 max-h-64 overflow-y-auto"
                >
                  {/* Search */}
                  <div className="sticky top-0 bg-white border-b border-brand-gray-100 px-3 py-2">
                    <input
                      type="text" value={catSearch}
                      onChange={(e) => setCatSearch(e.target.value)}
                      placeholder="Search categories…"
                      className="w-full text-sm outline-none text-brand-black placeholder:text-brand-stone"
                      autoFocus
                    />
                  </div>

                  {allCategories.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-brand-stone text-center">
                      No categories yet.{" "}
                      <a href="/admin/categories" className="underline text-brand-black">Add categories first</a>
                    </div>
                  ) : (
                    <div>
                      {parents
                        .filter((p) => {
                          const kids = childMap[p.id] ?? [];
                          const q    = catSearch.toLowerCase();
                          return !q || p.name.toLowerCase().includes(q) ||
                            kids.some((k) => k.name.toLowerCase().includes(q));
                        })
                        .map((parent) => {
                          const kids = (childMap[parent.id] ?? []).filter((k) =>
                            !catSearch || k.name.toLowerCase().includes(catSearch.toLowerCase())
                          );

                          return (
                            <div key={parent.id}>
                              {/* Parent row — selectable if no children */}
                              <div
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2.5 text-sm font-medium bg-brand-cream/40",
                                  kids.length === 0 && "cursor-pointer hover:bg-brand-gray-50"
                                )}
                                onClick={() => {
                                  if (kids.length === 0) {
                                    setValue("category_id", parent.id, { shouldValidate: true });
                                    setCatOpen(false);
                                  }
                                }}
                              >
                                <span className="text-brand-dark">{parent.name}</span>
                                {kids.length > 0 && (
                                  <ChevronRight size={11} strokeWidth={1.5} className="text-brand-stone ml-auto" />
                                )}
                                {kids.length === 0 && categoryId === parent.id && (
                                  <Check size={12} strokeWidth={2.5} className="ml-auto text-brand-black" />
                                )}
                              </div>

                              {/* Child rows */}
                              {kids.map((child) => (
                                <button key={child.id} type="button"
                                  onClick={() => {
                                    setValue("category_id", child.id, { shouldValidate: true });
                                    setCatOpen(false);
                                  }}
                                  className={cn(
                                    "w-full flex items-center gap-2 pl-7 pr-3 py-2.5 text-sm text-left transition-colors",
                                    categoryId === child.id
                                      ? "bg-brand-black text-white"
                                      : "text-brand-muted hover:bg-brand-gray-50 hover:text-brand-black"
                                  )}>
                                  <span className="text-brand-stone mr-0.5">└</span>
                                  {child.name}
                                  {categoryId === child.id && (
                                    <Check size={12} strokeWidth={2.5} className="ml-auto" />
                                  )}
                                </button>
                              ))}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-brand-stone mb-1.5">Tags (comma separated)</label>
            <input {...register("tags")} placeholder="oversized, cotton, summer" className={fi(false)} />
          </div>

          {/* Flags */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input {...register("is_new")} type="checkbox" className="w-4 h-4 accent-brand-black" />
              <span className="text-sm text-brand-dark">Mark as New</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input {...register("is_featured")} type="checkbox" className="w-4 h-4 accent-brand-black" />
              <span className="text-sm text-brand-dark">Featured Product</span>
            </label>
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold tracking-widest uppercase text-brand-stone">
                Variants * <span className="normal-case tracking-normal font-normal">(size, stock, SKU)</span>
              </p>
              <button type="button"
                onClick={() => append({ size: "", color: "", stock: 0, sku: "" })}
                className="flex items-center gap-1 text-xs font-medium text-brand-black hover:opacity-70">
                <Plus size={12} strokeWidth={2} />Add
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, i) => (
                <div key={field.id} className="border border-brand-gray-200 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-brand-stone">
                      Variant {i + 1}
                    </span>
                    <button type="button"
                      onClick={() => fields.length > 1 && remove(i)}
                      disabled={fields.length <= 1}
                      className="text-red-400 hover:text-red-600 disabled:opacity-20 transition-colors">
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-brand-stone block mb-1">Size *</label>
                      <input {...register(`variants.${i}.size`)} placeholder="XS / S / M / L / XL"
                        className={fi(!!errors.variants?.[i]?.size)} />
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-stone block mb-1">Color</label>
                      <input {...register(`variants.${i}.color`)} placeholder="Black"
                        className={fi(false)} />
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-stone block mb-1">Stock *</label>
                      <input {...register(`variants.${i}.stock`)} type="number" min={0} placeholder="10"
                        className={fi(false)} />
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-stone block mb-1">SKU *</label>
                      <input {...register(`variants.${i}.sku`)} placeholder="SSM-TEE-BLK-M"
                        className={fi(!!errors.variants?.[i]?.sku)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-brand-gray-100 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 btn-outline py-3 text-xs">Cancel</button>
          <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}
            className="flex-1 btn-primary py-3 text-xs disabled:opacity-60 justify-center">
            {isSubmitting
              ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span>
              : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
