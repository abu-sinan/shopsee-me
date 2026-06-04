import type { Metadata } from "next";
import { HeroSection } from "@/features/home/HeroSection";
import { CategoriesSection } from "@/features/home/CategoriesSection";
import { NewArrivalsSection } from "@/features/home/NewArrivalsSection";
import { BrandStatement } from "@/features/home/BrandStatement";
import { FeaturedProducts } from "@/features/home/FeaturedProducts";
import { NewsletterSection } from "@/features/home/NewsletterSection";
import { SITE_CONFIG } from "@/constants";

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <NewArrivalsSection />
      <BrandStatement />
      <FeaturedProducts />
      <NewsletterSection />
    </>
  );
}
