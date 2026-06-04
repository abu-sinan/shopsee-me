"use client";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[ShopSeeMe Error]", error); }, [error]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="label-caps mb-4 text-brand-gray-400">Something went wrong</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-black mb-4 tracking-tight">Unexpected Error</h1>
      <p className="text-sm text-brand-gray-500 max-w-xs mb-8 leading-relaxed">We&apos;ve logged this error. Please try again or return to the homepage.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={reset} className="btn-primary gap-2">Try Again</button>
        <Link href="/" className="btn-outline gap-2">Go Home <ArrowRight size={14} strokeWidth={1.5} /></Link>
      </div>
      {error.digest && <p className="mt-6 text-[10px] font-mono text-brand-gray-300">Error ID: {error.digest}</p>}
    </div>
  );
}
