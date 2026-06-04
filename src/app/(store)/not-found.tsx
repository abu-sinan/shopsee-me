import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <p className="label-caps mb-4 text-brand-gray-400">Error 404</p>
      <h1 className="font-display text-6xl md:text-8xl font-bold text-brand-black leading-none tracking-tight mb-4">Not Found</h1>
      <p className="text-base text-brand-gray-500 max-w-sm mb-8 leading-relaxed">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="btn-primary gap-2">Back to Home <ArrowRight size={14} strokeWidth={1.5} /></Link>
        <Link href="/shop" className="btn-outline">Browse Products</Link>
      </div>
    </div>
  );
}
