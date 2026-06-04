"use client";

import Link  from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    label:    "Men",
    desc:     "Minimal Essentials",
    href:     "/men",
    image:    "/images/categories/men.svg",
    span:     "col-span-1 row-span-2",
    aspect:   "aspect-[3/5]",
  },
  {
    label:    "Women",
    desc:     "The New Season Edit",
    href:     "/women",
    image:    "/images/categories/women.svg",
    span:     "col-span-1 row-span-1",
    aspect:   "aspect-[4/3]",
  },
  {
    label:    "Kids",
    desc:     "Play & Style",
    href:     "/kids",
    image:    "/images/categories/kids.svg",
    span:     "col-span-1 row-span-1",
    aspect:   "aspect-[4/3]",
  },
  {
    label:    "Accessories",
    desc:     "Complete the Look",
    href:     "/accessories",
    image:    "/images/categories/accessories.svg",
    span:     "col-span-1 row-span-1",
    aspect:   "aspect-[4/3]",
  },
] as const;

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function CategoriesSection() {
  return (
    <section className="section-lg bg-brand-white" aria-labelledby="cats-heading">
      <div className="container-brand">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 md:mb-12">
          <div>
            <p className="label-sm mb-3">Shop by Category</p>
            <h2 id="cats-heading" className="text-display-md text-brand-black">
              Find Your Style
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-2 text-[0.6875rem] font-medium tracking-widest-2 uppercase text-brand-ash hover:text-brand-black transition-colors group"
          >
            View All
            <ArrowUpRight size={13} strokeWidth={1.5} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Category grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
        >
          {categories.map((cat) => (
            <motion.div key={cat.href} variants={item}>
              <Link
                href={cat.href}
                className="group relative block overflow-hidden bg-brand-cream"
                style={{ aspectRatio: "3/4" }}
              >
                {/* Image */}
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-700 ease-brand group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  unoptimized
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/10 transition-colors duration-500" />

                {/* Label */}
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[0.6875rem] font-medium tracking-widest-2 uppercase text-white/60 mb-1">
                        {cat.desc}
                      </p>
                      <h3 className="font-display font-light text-xl md:text-2xl text-white leading-none">
                        {cat.label}
                      </h3>
                    </div>
                    <div className="w-8 h-8 border border-white/30 flex items-center justify-center text-white/50 group-hover:bg-white group-hover:text-brand-black group-hover:border-white transition-all duration-300">
                      <ArrowUpRight size={13} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
