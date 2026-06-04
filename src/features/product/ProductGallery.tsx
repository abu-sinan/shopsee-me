"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const prev = useCallback(() => setActiveIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActiveIndex((i) => (i + 1) % images.length), [images.length]);
  const activeImage = images[activeIndex];

  if (images.length === 0) return <div className="aspect-[3/4] bg-brand-gray-100 flex items-center justify-center"><span className="text-brand-gray-300 text-sm">No image</span></div>;

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4">
        {images.length > 1 && (
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-16 md:max-h-[640px]">
            {images.map((img, i) => (
              <button key={img.id} onClick={() => setActiveIndex(i)} className={cn("relative shrink-0 aspect-[3/4] w-16 md:w-full overflow-hidden border-2 transition-all duration-200", i === activeIndex ? "border-brand-black" : "border-transparent opacity-60 hover:opacity-100")} aria-label={`View image ${i + 1}`}>
                <Image src={img.url} alt={img.alt || `${productName} view ${i + 1}`} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 relative group">
          <div className="relative aspect-[3/4] overflow-hidden bg-brand-gray-100">
            <AnimatePresence mode="wait">
              <motion.div key={activeIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0">
                {activeImage && <Image src={activeImage.url} alt={activeImage.alt || productName} fill priority={activeIndex === 0} className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />}
              </motion.div>
            </AnimatePresence>
            <button onClick={() => setZoomOpen(true)} className="absolute top-4 right-4 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" aria-label="Zoom"><ZoomIn size={14} strokeWidth={1.5} className="text-brand-black" /></button>
            {images.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" aria-label="Previous"><ChevronLeft size={16} strokeWidth={1.5} className="text-brand-black" /></button>
                <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" aria-label="Next"><ChevronRight size={16} strokeWidth={1.5} className="text-brand-black" /></button>
              </>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                {images.map((_, i) => <button key={i} onClick={() => setActiveIndex(i)} className={cn("transition-all duration-300", i === activeIndex ? "w-5 h-1 bg-brand-black" : "w-1 h-1 bg-brand-black/30 rounded-full")} aria-label={`Image ${i + 1}`} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {zoomOpen && activeImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setZoomOpen(false)}>
            <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white z-10" onClick={() => setZoomOpen(false)} aria-label="Close"><X size={20} strokeWidth={1.5} /></button>
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white z-10"><ChevronLeft size={22} strokeWidth={1.5} /></button>
                <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/70 hover:text-white z-10"><ChevronRight size={22} strokeWidth={1.5} /></button>
              </>
            )}
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} transition={{ duration: 0.3 }} className="relative w-[90vw] h-[90dvh] max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <Image src={activeImage.url} alt={activeImage.alt || "Zoomed view"} fill className="object-contain" sizes="90vw" quality={90} />
            </motion.div>
            {images.length > 1 && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest">{activeIndex + 1} / {images.length}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
