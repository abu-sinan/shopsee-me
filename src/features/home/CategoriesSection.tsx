"use client";

import Link  from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    label: "Men",
    desc:  "Essential Collection",
    href:  "/men",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&h=800&q=80",
  },
  {
    label: "Women",
    desc:  "New Season Edit",
    href:  "/women",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&h=800&q=80",
  },
  {
    label: "Kids",
    desc:  "Play & Style",
    href:  "/kids",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&h=800&q=80",
  },
  {
    label: "Accessories",
    desc:  "Complete the Look",
    href:  "/accessories",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&h=800&q=80",
  },
] as const;

export function CategoriesSection() {
  return (
    <section className="section-lg bg-white" aria-labelledby="cats-heading">
      <div className="container-brand">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 md:mb-14">
          <div>
            <p className="label-sm mb-3">Browse by Category</p>
            <h2 id="cats-heading"
              className="font-display font-light text-brand-black"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)", letterSpacing: "-0.02em" }}>
              Find Your Style
            </h2>
          </div>
          <Link href="/shop"
            className="hidden sm:flex items-center gap-1.5 text-[0.6875rem] font-medium tracking-widest-2 uppercase text-brand-stone hover:text-brand-black transition-colors group">
            View All
            <ArrowUpRight size={12} strokeWidth={1.5}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Grid */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.href}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
              }}
            >
              <Link
                href={cat.href}
                className="group relative block overflow-hidden bg-brand-cream"
                style={{ aspectRatio: "3/4" }}
              >
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-700 ease-brand group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  quality={85}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                {/* Label */}
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-medium tracking-widest-2 uppercase text-white/55 mb-1">
                      {cat.desc}
                    </p>
                    <h3 className="font-display font-light text-xl md:text-2xl text-white leading-none">
                      {cat.label}
                    </h3>
                  </div>
                  <div className="w-8 h-8 border border-white/25 flex items-center justify-center text-white/50 group-hover:bg-white group-hover:text-brand-black group-hover:border-white transition-all duration-300 shrink-0">
                    <ArrowUpRight size={13} strokeWidth={1.5} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop" className="btn-outline btn-sm inline-flex">Browse All</Link>
        </div>
      </div>
    </section>
  );
}
