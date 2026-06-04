"use client";

import { useState, useEffect } from "react";
import Link    from "next/link";
import Image   from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";

const slides = [
  {
    id:       1,
    eyebrow:  "New Season Collection",
    headline: "Modern Fashion\nFor Everyday\nConfidence",
    sub:      "Discover the SS2025 Collection",
    cta:      { label: "Explore Collection", href: "/shop" },
    cta2:     { label: "New Arrivals",        href: "/new"  },
    image:    "/images/hero/hero-1.svg",
    align:    "left" as const,
  },
  {
    id:       2,
    eyebrow:  "Women's Edit",
    headline: "Effortless Style,\nEvery Single Day",
    sub:      "Premium fabrics, minimal silhouettes",
    cta:      { label: "Shop Women",  href: "/women"   },
    cta2:     { label: "View Lookbook", href: "/lookbook" },
    image:    "/images/hero/hero-2.svg",
    align:    "center" as const,
  },
  {
    id:       3,
    eyebrow:  "Men's Collection",
    headline: "Refined.\nMinimal.\nDistinct.",
    sub:      "Crafted for the modern Bangladeshi man",
    cta:      { label: "Shop Men", href: "/men" },
    cta2:     { label: "Explore", href: "/men" },
    image:    "/images/hero/hero-3.svg",
    align:    "right" as const,
  },
] as const;

export function HeroSection() {
  const [current, setCurrent]   = useState(0);
  const [paused,  setPaused]    = useState(false);
  const [loaded,  setLoaded]    = useState(false);
  const slide = slides[current];

  useEffect(() => { setLoaded(true); }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className="relative w-full overflow-hidden bg-brand-dark"
      style={{ height: "100dvh", minHeight: 640, maxHeight: 1000 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1,  scale: 1    }}
          exit={{    opacity: 0               }}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.headline.replace(/\n/g, " ")}
            fill
            priority={slide.id === 1}
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
          {/* Layered gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-16 md:pb-20 lg:pb-24">
        <div className="container-brand">
          <div className="max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div key={slide.id}>
                {/* Eyebrow */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0  }}
                  exit={{    opacity: 0, y: -8  }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                  className="flex items-center gap-3 mb-5"
                >
                  <span className="w-8 h-px bg-white/50" />
                  <span className="label-xs text-white/60 tracking-widest-4">
                    {slide.eyebrow}
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0  }}
                  exit={{    opacity: 0, y: -12 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="font-display font-light text-white whitespace-pre-line leading-none tracking-tight"
                  style={{ fontSize: "clamp(3.5rem, 8vw, 7.5rem)" }}
                >
                  {slide.headline}
                </motion.h1>

                {/* Sub + CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0  }}
                  exit={{    opacity: 0, y: -8  }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <p className="text-sm text-white/55 max-w-xs leading-relaxed hidden md:block mr-4">
                    {slide.sub}
                  </p>
                  <Link
                    href={slide.cta.href}
                    className="inline-flex items-center gap-3 bg-white text-brand-black px-7 py-3.5 text-[0.6875rem] font-semibold tracking-widest-3 uppercase hover:bg-brand-cream transition-colors"
                  >
                    {slide.cta.label}
                    <ArrowRight size={13} strokeWidth={2} />
                  </Link>
                  <Link
                    href={slide.cta2.href}
                    className="inline-flex items-center gap-2 text-white/70 hover:text-white text-[0.6875rem] font-medium tracking-widest-2 uppercase transition-colors border-b border-transparent hover:border-white/40 pb-px"
                  >
                    {slide.cta2.label}
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide indicators — horizontal lines */}
          <div className="flex items-end gap-2 mt-10">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className="flex flex-col items-start gap-1.5 group"
              >
                <span className={cn(
                  "transition-all duration-700 block h-px",
                  i === current ? "w-12 bg-white" : "w-4 bg-white/30 group-hover:bg-white/50"
                )} />
                <span className={cn(
                  "label-xs transition-colors",
                  i === current ? "text-white/70" : "text-white/25 group-hover:text-white/40"
                )}>
                  0{i + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      {loaded && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })}
          className="absolute bottom-8 right-8 md:right-12 flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
          aria-label="Scroll down"
        >
          <span className="writing-vertical label-xs tracking-widest-4">Scroll</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ArrowDown size={14} strokeWidth={1.5} />
          </motion.div>
        </motion.button>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="h-full bg-white/30"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 7, ease: "linear" }}
          />
        </AnimatePresence>
      </div>
    </section>
  );
}

// cn helper re-import for local use
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
