import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <p className="label-caps mb-4 text-brand-gray-400">Coming Soon</p>
      <h1 className="font-display text-3xl font-bold text-brand-black mb-4">
        Page Under Construction
      </h1>
      <p className="text-sm text-brand-gray-500 max-w-xs mb-8">
        This page is coming soon. In the meantime, explore our store.
      </p>
      <Link href="/" className="btn-primary gap-2">
        Back to Home <ArrowRight size={14} strokeWidth={1.5} />
      </Link>
    </div>
  );
}
