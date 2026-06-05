"use client";

import { useRef }  from "react";
import Link        from "next/link";
import Image       from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function BrandStatement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-brand-black"
      style={{ minHeight: "min(70vh, 700px)" }}
    >
      {/* Parallax background */}
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80"
          alt="ShopSeeMe boutique"
          fill
          className="object-cover opacity-35"
          sizes="100vw"
          quality={80}
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/60 via-brand-black/40 to-brand-black/70" />

      <div className="relative z-10 container-brand py-24 md:py-32 flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-[10px] font-medium tracking-widest-4 uppercase text-white/30 mb-7"
        >
          Our Philosophy
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display font-light text-white text-balance max-w-4xl"
          style={{ fontSize: "clamp(2.25rem, 5.5vw, 5.5rem)", lineHeight: 1.05, letterSpacing: "-0.03em" }}
        >
          Confidence Through{" "}
          <em className="not-italic text-brand-stone">Craft</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.22, duration: 0.7 }}
          className="mt-7 text-sm md:text-base text-white/40 max-w-lg leading-relaxed"
        >
          Every piece is designed with intention — minimal in form, meaningful in quality.
          Built for the modern Bangladeshi who moves with purpose.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.32, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/about"
            className="inline-flex items-center gap-2.5 border border-white/20 text-white/75 hover:border-white hover:text-white px-7 py-3.5 text-[0.6875rem] font-medium tracking-widest-3 uppercase transition-all duration-300">
            Our Story
            <ArrowRight size={12} strokeWidth={1.5} />
          </Link>
          <Link href="/shop"
            className="text-[0.6875rem] font-medium tracking-widest-2 uppercase text-white/35 hover:text-white transition-colors">
            Shop Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
