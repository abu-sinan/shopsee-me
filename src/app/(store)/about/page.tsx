import type { Metadata } from "next";
import Image   from "next/image";
import Link    from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/constants";

export const metadata: Metadata = {
  title:       "About Us",
  description: `Learn about ${SITE_CONFIG.name} — a premium Bangladeshi fashion brand.`,
};

const VALUES = [
  { title: "Quality First",        description: "Every fabric is selected with intention. Every stitch is a commitment to craftsmanship that stands the test of time." },
  { title: "Made for Bangladesh",  description: "We design for the Bangladeshi climate, culture, and lifestyle — from Dhaka's heat to Sylhet's monsoons." },
  { title: "Minimal by Nature",    description: "We believe in owning less but better. Our pieces are designed to work harder and last longer in your wardrobe." },
  { title: "Transparent & Fair",   description: "We price honestly, manufacture locally, and build relationships — not just transactions." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden bg-brand-gray-900">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80"
          alt="ShopSeeMe studio"
          fill
          priority
          className="object-cover opacity-60"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 container-brand pb-16">
          <p className="label-caps text-white/60 mb-3">Our Story</p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight max-w-xl">
            Designed for<br />Everyday<br />Confidence
          </h1>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 md:py-28">
        <div className="container-brand max-w-3xl mx-auto text-center">
          <p className="label-caps mb-6">Our Mission</p>
          <p className="font-display text-2xl md:text-4xl font-bold text-brand-black leading-tight tracking-tight text-balance">
            We started {SITE_CONFIG.name} because we believed Bangladeshis deserve fashion that is premium, minimal, and truly theirs.
          </p>
          <p className="mt-6 text-base text-brand-gray-500 leading-relaxed max-w-2xl mx-auto">
            Born in Dhaka, shaped by the energy of a generation that moves fast and values quality — {SITE_CONFIG.name} is the intersection of modern design and timeless craft.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 bg-brand-gray-50 border-y border-brand-gray-100">
        <div className="container-brand">
          <div className="text-center mb-12">
            <p className="label-caps mb-3">What We Stand For</p>
            <h2 className="heading-md text-brand-black">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, i) => (
              <div key={value.title} className="bg-white border border-brand-gray-100 p-6 md:p-8">
                <span className="font-display text-4xl font-bold text-brand-gray-100 block mb-4 leading-none">
                  0{i + 1}
                </span>
                <h3 className="font-display font-bold text-lg text-brand-black mb-3">{value.title}</h3>
                <p className="text-sm text-brand-gray-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand image + quote */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
        <div className="relative min-h-[300px]">
          <Image
            src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"
            alt="Craftsmanship"
            fill
            className="object-cover"
            sizes="50vw"
            unoptimized
          />
        </div>
        <div className="bg-brand-black flex items-center justify-center p-12 md:p-16">
          <div className="max-w-sm">
            <p className="label-caps text-white/40 mb-5">The Standard</p>
            <blockquote className="font-display text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
              &ldquo;Fashion fades. Style is eternal.&rdquo;
            </blockquote>
            <p className="text-sm text-white/40 mt-5 tracking-widest">— Yves Saint Laurent</p>
            <Link href="/shop" className="inline-flex items-center gap-2 mt-8 border border-white/30 text-white px-6 py-3 text-xs font-medium tracking-widest uppercase hover:bg-white/10 hover:border-white transition-all">
              Shop the Collection <ArrowRight size={12} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container-brand max-w-2xl mx-auto text-center">
          <p className="label-caps mb-4">Join Us</p>
          <h2 className="heading-md text-brand-black mb-5">Be Part of the Story</h2>
          <p className="body-md text-brand-gray-500 mb-8">
            Follow our journey on Instagram, shop the latest collections, and join a community that believes confidence is the best outfit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop" className="btn-primary gap-2">
              Shop Now <ArrowRight size={13} strokeWidth={1.5} />
            </Link>
            <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" className="btn-outline">
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
