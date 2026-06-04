"use client";
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence }     from "framer-motion";
import { useForm, useFieldArray }      from "react-hook-form";
import { zodResolver }                 from "@hookform/resolvers/zod";
import { z }                           from "zod";
import { X, Plus, Trash2, ChevronDown, Check } from "lucide-react";
import { createClient }  from "@/lib/supabase/client";
import { slugify, cn }   from "@/lib/utils";
import type { Product, Category } from "@/types";

const variantSchema = z.object({
  id:    z.string().optional(),
  size:  z.string().min(1, "Size required"),
  color: z.string().optional(),
  stock: z.coerce.number().min(0),
  sku:   z.string().min(1, "SKU required"),
});

const productSchema = z.object({
  name:             z.string().min(2, "Name required"),
  slug:             z.string().min(2, "Slug required"),
  description:      z.string().min(10, "Description required"),
  price:            z.coerce.number().min(1, "Price required"),
  compare_at_price: z.coerce.number().optional(),
  category_id:      z.string().min(1, "Category required"),
  is_new:           z.boolean(),
  is_featured:      z.boolean(),
  tags:             z.string(),
  variants:         z.array(variantSchema).min(1, "At least one variant required"),
});

type PFV = z.infer<typeof productSchema>;

export function ProductFormModal({
  product,
  onSaved,
  onClose,
}: {
  product:  Product | null;
  onSaved:  (p: Product) => void;
  onClose:  () => void;
}) {
  const [categories, setCategories]         = useState<Category[]>([]);
  const [catOpen, setCatOpen]               = useState(false);
  const [selectedCatName, setSelectedName]  = useState("");
  const [serverError, setServerError]       = useState<string | null>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
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
  const nameValue    = watch("name");
  const categoryId   = watch("category_id");

  // Auto-slug from name
  useEffect(() => {
    if (!isEdit && nameValue) setValue("slug", slugify(nameValue));
  }, [nameValue, isEdit, setValue]);

  // Load categories
  useEffect(() => {
    createClient()
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data }) => {
        const cats = (data ?? []) as Category[];
        setCategories(cats);
        // Set initial category name if editing
        if (product?.category_id) {
          const found = cats.find((c) => c.id === product.category_id);
          if (found) setSelectedName(found.name);
        }
      });
  }, [product?.category_id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectCategory = (cat: Category) => {
    setValue("category_id", cat.id, { shouldValidate: true });
    setSelectedName(cat.name);
    setCatOpen(false);
  };

  const onSubmit = async (data: PFV) => {
    setServerError(null);
    const supabase = createClient();
    const payload  = {
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

    let savedId: string;

    if (isEdit) {
      const { data: updated, error } = await supabase
        .from("products").update(payload).eq("id", product!.id).select("id").single();
      if (error) { setServerError(error.message); return; }
      savedId = updated.id;
    } else {
      const { data: created, error } = await supabase
        .from("products").insert(payload).select("id").single();
      if (error) { setServerError(error.message); return; }
      savedId = created.id;
    }

    // Handle variants
    const variantsPayload = data.variants.map((v) => ({
      ...(v.id ? { id: v.id } : {}),
      product_id: savedId,
      size:       v.size,
      color:      v.color || null,
      stock:      v.stock,
      sku:        v.sku || `${slugify(data.slug)}-${v.size}-${Date.now()}`,
    }));

    if (isEdit) {
      const toDelete = product!.variants
        .map((v) => v.id)
        .filter((id) => !data.variants.map((v) => v.id).includes(id));
      if (toDelete.length > 0)
        await supabase.from("product_variants").delete().in("id", toDelete);
    }

    await supabase.from("product_variants").upsert(variantsPayload, { onConflict: "id" });

    const { data: final } = await supabase
      .from("products")
      .select("*, category:categories(*), images:product_images(*), variants:product_variants(*)")
      .eq("id", savedId)
      .single();

    if (final) onSaved(final as Product);
  };

  const fi = (hasError: boolean) =>
    cn(
      "w-full px-3 py-2.5 text-sm bg-white border outline-none transition-colors",
      hasError ? "border-red-300" : "border-brand-gray-200 focus:border-brand-gray-500"
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-2xl sm:rounded-none flex flex-col shadow-2xl"
        style={{ maxHeight: "92dvh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-gray-100 shrink-0">
          <h2 className="font-display font-light text-xl text-brand-black">
            {isEdit ? "Edit Product" : "New Product"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-brand-stone hover:text-brand-black transition-colors">
            <X size={17} strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {serverError && (
            <p className="p-3 bg-red-50 border border-red-200 text-sm text-red-600 rounded">{serverError}</p>
          )}

          {/* Name + Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Product Name *</label>
              <input {...register("name")} placeholder="e.g. Oversized Black Tee" className={fi(!!errors.name)} />
              {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-gray-600 mb-1.5">URL Slug *</label>
              <input {...register("slug")} className={fi(!!errors.slug)} />
              {errors.slug && <p className="mt-1 text-[11px] text-red-500">{errors.slug.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Description *</label>
            <textarea {...register("description")} rows={3} className={cn(fi(!!errors.description), "resize-none")} />
            {errors.description && <p className="mt-1 text-[11px] text-red-500">{errors.description.message}</p>}
          </div>

          {/* Price + Compare + Category */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Price (৳) *</label>
              <input {...register("price")} type="number" min={0} placeholder="1200" className={fi(!!errors.price)} />
              {errors.price && <p className="mt-1 text-[11px] text-red-500">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Compare (৳)</label>
              <input {...register("compare_at_price")} type="number" min={0} placeholder="1500" className={fi(false)} />
            </div>
            <div ref={catRef} className="relative">
              <label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Category *</label>
              {/* Hidden real input for form validation */}
              <input type="hidden" {...register("category_id")} />
              <button
                type="button"
                onClick={() => setCatOpen((v) => !v)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 text-sm border transition-colors text-left",
                  errors.category_id
                    ? "border-red-300 text-brand-black"
                    : categoryId
                    ? "border-brand-gray-200 text-brand-black"
                    : "border-brand-gray-200 text-brand-stone"
                )}
              >
                <span className="truncate">{selectedCatName || "Select…"}</span>
                <ChevronDown size={13} strokeWidth={1.5} className={cn("shrink-0 ml-1 transition-transform", catOpen && "rotate-180")} />
              </button>
              {errors.category_id && <p className="mt-1 text-[11px] text-red-500">Required</p>}

              {/* Custom dropdown */}
              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 z-[60] bg-white border border-brand-gray-200 shadow-xl max-h-48 overflow-y-auto mt-1"
                  >
                    {categories.length === 0 ? (
                      <div className="px-3 py-3 text-xs text-brand-stone text-center">
                        No categories yet.{" "}
                        <a href="/admin/categories" className="underline text-brand-black">Add one first</a>
                      </div>
                    ) : (
                      categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => selectCategory(cat)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors",
                            categoryId === cat.id
                              ? "bg-brand-black text-white"
                              : "hover:bg-brand-gray-50 text-brand-dark"
                          )}
                        >
                          {cat.name}
                          {categoryId === cat.id && <Check size={12} strokeWidth={2.5} />}
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Tags (comma separated)</label>
            <input {...register("tags")} placeholder="oversized, cotton, summer" className={fi(false)} />
          </div>

          {/* Checkboxes */}
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
              <p className="text-xs font-semibold tracking-widest uppercase text-brand-stone">Variants *</p>
              <button
                type="button"
                onClick={() => append({ size: "", color: "", stock: 0, sku: "" })}
                className="flex items-center gap-1 text-xs font-medium text-brand-black hover:opacity-70 transition-opacity"
              >
                <Plus size={12} strokeWidth={2} /> Add Variant
              </button>
            </div>

            {/* Mobile-friendly variant rows */}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-brand-gray-200 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-brand-stone">Variant {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => fields.length > 1 && remove(index)}
                      disabled={fields.length <= 1}
                      className="text-red-400 hover:text-red-600 disabled:opacity-20 transition-colors"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-brand-stone mb-1 block">Size *</label>
                      <input {...register(`variants.${index}.size`)} placeholder="M" className={fi(!!errors.variants?.[index]?.size)} />
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-stone mb-1 block">Color</label>
                      <input {...register(`variants.${index}.color`)} placeholder="Black" className={fi(false)} />
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-stone mb-1 block">Stock *</label>
                      <input {...register(`variants.${index}.stock`)} type="number" min={0} placeholder="10" className={fi(false)} />
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-stone mb-1 block">SKU *</label>
                      <input {...register(`variants.${index}.sku`)} placeholder="SSM-TEE-BLK-M" className={fi(!!errors.variants?.[index]?.sku)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-brand-gray-100 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 btn-outline py-3 text-xs">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex-1 btn-primary py-3 text-xs disabled:opacity-60 justify-center"
          >
            {isSubmitting
              ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span>
              : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
