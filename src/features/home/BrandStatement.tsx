"use client";

import { useRef }  from "react";
import Link        from "next/link";
import Image       from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function BrandStatement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-brand-black" style={{ minHeight: 600 }}>
      {/* Parallax background */}
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <Image
          src="/images/brand/statement-bg.svg"
          alt="ShopSeeMe philosophy"
          fill
          className="object-cover opacity-30"
          sizes="100vw"
          unoptimized
        />
      </motion.div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 bg-brand-black/60" />

      {/* Left accent line */}
      <div className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 hidden lg:flex">
        <div className="w-px h-24 bg-white/10" />
        <span className="writing-vertical label-xs text-white/20 tracking-widest-4">Philosophy</span>
        <div className="w-px h-24 bg-white/10" />
      </div>

      <div className="relative z-10 container-brand py-28 md:py-36 flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="label-sm text-white/30 mb-8 tracking-widest-4"
        >
          Our Philosophy
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display font-light text-white text-balance max-w-4xl"
          style={{ fontSize: "clamp(2.5rem, 5vw, 5.5rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
        >
          Confidence Through
          <em className="not-italic text-brand-accent"> Craft</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="mt-7 text-base text-white/45 max-w-xl leading-relaxed"
        >
          Every piece is designed with intention — minimal in form, meaningful in quality.
          Built for the modern Bangladeshi who moves with purpose.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/about"
            className="inline-flex items-center gap-2.5 border border-white/20 text-white/80 hover:border-white hover:text-white px-8 py-3.5 text-[0.6875rem] font-medium tracking-widest-3 uppercase transition-all duration-300"
          >
            Our Story
            <ArrowRight size={12} strokeWidth={1.5} />
          </Link>
          <Link
            href="/shop"
            className="text-[0.6875rem] font-medium tracking-widest-2 uppercase text-white/40 hover:text-white transition-colors border-b border-transparent hover:border-white/30 pb-px"
          >
            Shop Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
