"use client";

import { useState, useEffect } from "react";
import Link    from "next/link";
import Image   from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn }         from "@/lib/utils";

const slides = [
  {
    id:       1,
    eyebrow:  "New Season — 2025",
    headline: "Modern Fashion\nFor Everyday\nConfidence",
    sub:      "Discover the new season collection",
    cta:      { label: "Shop Now",      href: "/shop" },
    cta2:     { label: "New Arrivals",  href: "/new"  },
    image:    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80",
    overlay:  "from-black/65 via-black/20 to-transparent",
  },
  {
    id:       2,
    eyebrow:  "Women's Edit",
    headline: "Effortless Style,\nEvery Day",
    sub:      "Premium fabrics, minimal silhouettes",
    cta:      { label: "Shop Women",    href: "/women"   },
    cta2:     { label: "View All",      href: "/women"   },
    image:    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80",
    overlay:  "from-black/60 via-black/15 to-transparent",
  },
  {
    id:       3,
    eyebrow:  "Men's Collection",
    headline: "Refined.\nMinimal.\nDistinct.",
    sub:      "Crafted for the modern Bangladeshi man",
    cta:      { label: "Shop Men",      href: "/men" },
    cta2:     { label: "Explore",       href: "/men" },
    image:    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80",
    overlay:  "from-black/60 via-black/10 to-transparent",
  },
] as const;

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const slide = slides[current];

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className="relative w-full overflow-hidden bg-brand-dark"
      style={{ height: "100dvh", minHeight: 600, maxHeight: 1000 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.headline.replace(/\n/g, " ")}
            fill priority={slide.id === 1}
            className="object-cover object-center"
            sizes="100vw"
            quality={90}
          />
          {/* Gradient overlay */}
          <div className={cn("absolute inset-0 bg-gradient-to-r", slide.overlay)} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-16 md:pb-20 lg:pb-28">
        <div className="container-brand">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div key={slide.id}>

                {/* Eyebrow */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-3 mb-5"
                >
                  <span className="w-8 h-px bg-white/50" />
                  <span className="text-[10px] font-medium tracking-widest-4 uppercase text-white/60">
                    {slide.eyebrow}
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.8, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="font-display font-light text-white leading-[0.92] tracking-tight whitespace-pre-line"
                  style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)" }}
                >
                  {slide.headline}
                </motion.h1>

                {/* Sub + CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <p className="hidden md:block text-sm text-white/50 max-w-xs leading-relaxed mr-4">
                    {slide.sub}
                  </p>
                  <Link href={slide.cta.href}
                    className="inline-flex items-center gap-3 bg-white text-brand-black px-7 py-3.5 text-[0.6875rem] font-semibold tracking-widest-3 uppercase hover:bg-brand-cream transition-colors">
                    {slide.cta.label}
                    <ArrowRight size={12} strokeWidth={2} />
                  </Link>
                  <Link href={slide.cta2.href}
                    className="inline-flex items-center gap-2 text-white/70 hover:text-white text-[0.6875rem] font-medium tracking-widest-2 uppercase transition-colors border-b border-transparent hover:border-white/40 pb-px">
                    {slide.cta2.label}
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide dots */}
          <div className="flex items-center gap-3 mt-10">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className="group flex items-center gap-2"
              >
                <span className={cn(
                  "block h-px transition-all duration-700",
                  i === current ? "w-12 bg-white" : "w-4 bg-white/30 group-hover:bg-white/50"
                )} />
                <span className={cn(
                  "text-[9px] font-medium tracking-widest-2 transition-colors",
                  i === current ? "text-white/60" : "text-white/20 group-hover:text-white/35"
                )}>
                  0{i + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="h-full bg-white/25"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 7, ease: "linear" }}
          />
        </AnimatePresence>
      </div>
    </section>
  );
}
