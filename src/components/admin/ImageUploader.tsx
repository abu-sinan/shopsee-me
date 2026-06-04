"use client";
import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, GripVertical, ImagePlus, Loader2 } from "lucide-react";
import { uploadProductImage, deleteProductImage } from "@/services/storage.service";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/store/toast.store";
import { cn } from "@/lib/utils";

interface PImg { id: string; url: string; alt: string; position: number; path?: string; }

export function ImageUploader({ productId, existingImages = [], onImagesChange }: { productId: string; existingImages?: PImg[]; onImagesChange?: (images: PImg[]) => void }) {
  const [images, setImages] = useState<PImg[]>(existingImages);
  const [draggingId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOver] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const notify = (updated: PImg[]) => { setImages(updated); onImagesChange?.(updated); };

  const handleFiles = useCallback(async (files: File[]) => {
    if (!productId) { toast.error("Save the product first before uploading images."); return; }
    setUploading(true);
    const supabase = createClient();
    for (const file of files) {
      const position = images.length + files.indexOf(file);
      const result = await uploadProductImage(file, productId, position);
      if (!result.success || !result.url) { toast.error("Upload failed", result.error); continue; }
      const { data: imgRow, error } = await supabase.from("product_images").insert({ product_id: productId, url: result.url, alt: "", position }).select().single();
      if (!error && imgRow) { const updated = [...images, { id: imgRow.id, url: result.url, alt: "", position, path: result.path }]; notify(updated); toast.success("Image uploaded"); }
    }
    setUploading(false);
  }, [images, productId]);

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")); if (files.length) handleFiles(files); };

  const handleDelete = async (img: PImg) => {
    const supabase = createClient();
    await supabase.from("product_images").delete().eq("id", img.id);
    if (img.path) await deleteProductImage(img.path);
    const updated = images.filter((i) => i.id !== img.id).map((i, idx) => ({ ...i, position: idx }));
    notify(updated); toast.success("Image removed");
  };

  const handleUpdateAlt = async (imgId: string, alt: string) => {
    const supabase = createClient();
    await supabase.from("product_images").update({ alt }).eq("id", imgId);
    notify(images.map((i) => (i.id === imgId ? { ...i, alt } : i)));
  };

  const handleDragEnd = async () => {
    if (!draggingId || !dragOverId || draggingId === dragOverId) { setDragId(null); setDragOver(null); return; }
    const from = images.findIndex((i) => i.id === draggingId);
    const to = images.findIndex((i) => i.id === dragOverId);
    const reordered = [...images];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const withPositions = reordered.map((img, idx) => ({ ...img, position: idx }));
    notify(withPositions);
    const supabase = createClient();
    await Promise.all(withPositions.map((img) => supabase.from("product_images").update({ position: img.position }).eq("id", img.id)));
    setDragId(null); setDragOver(null);
  };

  return (
    <div>
      <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-brand-gray-200 hover:border-brand-gray-400 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 py-8 px-6 text-center mb-4">
        {uploading ? <Loader2 size={24} strokeWidth={1.5} className="text-brand-gray-400 animate-spin" /> : <ImagePlus size={24} strokeWidth={1.5} className="text-brand-gray-300" />}
        <div><p className="text-sm font-medium text-brand-gray-600">{uploading ? "Uploading…" : "Drop images here or click to upload"}</p><p className="text-xs text-brand-gray-400 mt-0.5">JPEG, PNG, WebP · Max 5MB each</p></div>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const files = Array.from(e.target.files ?? []); if (files.length) handleFiles(files); e.target.value = ""; }} />
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AnimatePresence>
            {images.sort((a, b) => a.position - b.position).map((img) => (
              <motion.div key={img.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}
                draggable onDragStart={() => setDragId(img.id)} onDragOver={(e) => { e.preventDefault(); setDragOver(img.id); }} onDragEnd={handleDragEnd}
                className={cn("relative group border-2 transition-all", img.position === 0 ? "border-brand-black" : "border-transparent", draggingId === img.id && "opacity-40", dragOverId === img.id && draggingId !== img.id && "border-brand-accent scale-[1.02]")}>
                <div className="relative aspect-[3/4] bg-brand-gray-100 overflow-hidden">
                  <Image src={img.url} alt={img.alt || "Product image"} fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <div className="cursor-grab active:cursor-grabbing text-white/70 hover:text-white"><GripVertical size={18} strokeWidth={1.5} /></div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(img); }} className="w-8 h-8 bg-red-600 flex items-center justify-center text-white hover:bg-red-700" aria-label="Delete"><X size={14} strokeWidth={1.5} /></button>
                  </div>
                  {img.position === 0 && <span className="absolute top-1.5 left-1.5 text-[9px] font-bold tracking-widest uppercase bg-brand-black text-white px-1.5 py-0.5">Cover</span>}
                </div>
                <input type="text" value={img.alt} onChange={(e) => handleUpdateAlt(img.id, e.target.value)} placeholder="Alt text" onClick={(e) => e.stopPropagation()} className="w-full px-2 py-1.5 text-[11px] border-t border-brand-gray-100 bg-white text-brand-gray-600 placeholder:text-brand-gray-300 outline-none focus:bg-brand-gray-50 transition-colors" />
              </motion.div>
            ))}
          </AnimatePresence>
          <button onClick={() => inputRef.current?.click()} className="aspect-[3/4] border-2 border-dashed border-brand-gray-200 hover:border-brand-gray-400 flex flex-col items-center justify-center gap-2 text-brand-gray-300 hover:text-brand-gray-500 transition-all">
            <Upload size={20} strokeWidth={1.5} /><span className="text-[10px] font-medium tracking-wide">Add More</span>
          </button>
        </div>
      )}
      <p className="text-[11px] text-brand-gray-400 mt-2">Drag images to reorder · First image is the cover photo</p>
    </div>
  );
}
