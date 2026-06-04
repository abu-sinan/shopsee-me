export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-white">
      <div className="flex flex-col items-center gap-5">
        <span className="font-display font-bold text-2xl text-brand-black animate-pulse">
          ShopSeeMe
        </span>
        <div className="w-8 h-px bg-brand-gray-200 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-4 bg-brand-black" style={{ animation: "slide 1s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}
