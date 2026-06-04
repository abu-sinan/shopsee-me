"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify, cn } from "@/lib/utils";
import type { Product, Category } from "@/types";

const variantSchema = z.object({ id: z.string().optional(), size: z.string().min(1), color: z.string().optional(), stock: z.coerce.number().min(0), sku: z.string().min(1) });
const productSchema = z.object({
  name: z.string().min(2), slug: z.string().min(2), description: z.string().min(10),
  price: z.coerce.number().min(1), compare_at_price: z.coerce.number().optional(),
  category_id: z.string().min(1), is_new: z.boolean(), is_featured: z.boolean(),
  tags: z.string(), variants: z.array(variantSchema).min(1),
});
type PFV = z.infer<typeof productSchema>;

export function ProductFormModal({ product, onSaved, onClose }: { product: Product | null; onSaved: (p: Product) => void; onClose: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!product;
  const { register, handleSubmit, watch, setValue, control, formState: { errors, isSubmitting } } = useForm<PFV>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "", slug: product?.slug ?? "", description: product?.description ?? "",
      price: product?.price ?? 0, compare_at_price: product?.compare_at_price ?? undefined,
      category_id: product?.category_id ?? "", is_new: product?.is_new ?? false, is_featured: product?.is_featured ?? false,
      tags: product?.tags.join(", ") ?? "",
      variants: product?.variants.length ? product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color ?? "", stock: v.stock, sku: v.sku })) : [{ size: "M", color: "", stock: 10, sku: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const nameValue = watch("name");

  useEffect(() => { if (!isEdit && nameValue) setValue("slug", slugify(nameValue)); }, [nameValue, isEdit, setValue]);
  useEffect(() => { createClient().from("categories").select("*").order("name").then(({ data }) => setCategories((data ?? []) as Category[])); }, []);

  const onSubmit = async (data: PFV) => {
    setServerError(null);
    const supabase = createClient();
    const payload = { name: data.name, slug: data.slug, description: data.description, price: data.price, compare_at_price: data.compare_at_price || null, category_id: data.category_id, is_new: data.is_new, is_featured: data.is_featured, tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    let savedId: string;
    if (isEdit) {
      const { data: updated, error } = await supabase.from("products").update(payload).eq("id", product!.id).select("id").single();
      if (error) { setServerError(error.message); return; }
      savedId = updated.id;
    } else {
      const { data: created, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error) { setServerError(error.message); return; }
      savedId = created.id;
    }
    const variantsPayload = data.variants.map((v) => ({ ...(v.id ? { id: v.id } : {}), product_id: savedId, size: v.size, color: v.color || null, stock: v.stock, sku: v.sku || `${slugify(data.slug)}-${v.size}-${Date.now()}` }));
    if (isEdit) {
      const toDelete = product!.variants.map((v) => v.id).filter((id) => !data.variants.map((v) => v.id).includes(id));
      if (toDelete.length > 0) await supabase.from("product_variants").delete().in("id", toDelete);
    }
    await supabase.from("product_variants").upsert(variantsPayload, { onConflict: "id" });
    const { data: final } = await supabase.from("products").select("*, category:categories(*), images:product_images(*), variants:product_variants(*)").eq("id", savedId).single();
    if (final) onSaved(final as Product);
  };

  const fi = (hasError: boolean) => cn("w-full px-3 py-2 text-sm bg-white border outline-none transition-colors placeholder:text-brand-gray-300", hasError ? "border-red-300 focus:border-red-400" : "border-brand-gray-200 focus:border-brand-gray-400");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} transition={{ duration: 0.25 }} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-2xl max-h-[90dvh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-gray-100 shrink-0">
          <h2 className="font-display font-semibold text-lg">{isEdit ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} className="p-1 text-brand-gray-400 hover:text-brand-black"><X size={18} strokeWidth={1.5} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {serverError && <p className="p-3 bg-red-50 border border-red-200 text-sm text-red-600">{serverError}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Product Name *</label><input {...register("name")} className={fi(!!errors.name)} placeholder="e.g. Oversized Black Tee" />{errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name.message}</p>}</div>
            <div><label className="block text-xs font-medium text-brand-gray-600 mb-1.5">URL Slug *</label><input {...register("slug")} className={fi(!!errors.slug)} />{errors.slug && <p className="mt-1 text-[11px] text-red-500">{errors.slug.message}</p>}</div>
          </div>
          <div><label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Description *</label><textarea {...register("description")} rows={3} className={cn(fi(!!errors.description), "resize-none")} />{errors.description && <p className="mt-1 text-[11px] text-red-500">{errors.description.message}</p>}</div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Price (৳) *</label><input {...register("price")} type="number" min={0} className={fi(!!errors.price)} placeholder="1200" />{errors.price && <p className="mt-1 text-[11px] text-red-500">{errors.price.message}</p>}</div>
            <div><label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Compare Price</label><input {...register("compare_at_price")} type="number" min={0} className={fi(false)} placeholder="1500" /></div>
            <div><label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Category *</label>
              <select {...register("category_id")} className={cn(fi(!!errors.category_id), "cursor-pointer")}>
                <option value="">Select…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div><label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Tags (comma separated)</label><input {...register("tags")} className={fi(false)} placeholder="oversized, cotton, summer" /></div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input {...register("is_new")} type="checkbox" className="w-4 h-4 accent-brand-black" /><span className="text-sm text-brand-gray-700">Mark as New</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input {...register("is_featured")} type="checkbox" className="w-4 h-4 accent-brand-black" /><span className="text-sm text-brand-gray-700">Featured Product</span></label>
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold tracking-widest uppercase text-brand-gray-500">Variants *</label>
              <button type="button" onClick={() => append({ size: "", color: "", stock: 0, sku: "" })} className="flex items-center gap-1 text-xs font-medium text-brand-black hover:opacity-70"><Plus size={12} strokeWidth={2} />Add Variant</button>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[80px_80px_80px_1fr_32px] gap-2 items-end">
                  <div>{index === 0 && <p className="text-[10px] text-brand-gray-400 mb-1 font-medium">Size *</p>}<input {...register(`variants.${index}.size`)} placeholder="M" className={fi(!!errors.variants?.[index]?.size)} /></div>
                  <div>{index === 0 && <p className="text-[10px] text-brand-gray-400 mb-1 font-medium">Color</p>}<input {...register(`variants.${index}.color`)} placeholder="Black" className={fi(false)} /></div>
                  <div>{index === 0 && <p className="text-[10px] text-brand-gray-400 mb-1 font-medium">Stock *</p>}<input {...register(`variants.${index}.stock`)} type="number" min={0} placeholder="10" className={fi(false)} /></div>
                  <div>{index === 0 && <p className="text-[10px] text-brand-gray-400 mb-1 font-medium">SKU *</p>}<input {...register(`variants.${index}.sku`)} placeholder="SSM-TEE-BLK-M" className={fi(!!errors.variants?.[index]?.sku)} /></div>
                  <button type="button" onClick={() => fields.length > 1 && remove(index)} disabled={fields.length <= 1} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 disabled:opacity-20" aria-label="Remove"><Trash2 size={13} strokeWidth={1.5} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-brand-gray-100 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 btn-outline py-3 text-xs">Cancel</button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex-1 btn-primary py-3 text-xs disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
