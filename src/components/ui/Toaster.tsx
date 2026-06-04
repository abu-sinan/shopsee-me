"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToastStore, type Toast }    from "@/store/toast.store";
import { cn }                           from "@/lib/utils";

const ICONS = {
  success: CheckCircle2,
  error:   AlertCircle,
  info:    Info,
  warning: AlertTriangle,
};

const STYLES: Record<Toast["type"], string> = {
  success: "bg-white border-l-4 border-l-green-500",
  error:   "bg-white border-l-4 border-l-red-500",
  info:    "bg-white border-l-4 border-l-blue-500",
  warning: "bg-white border-l-4 border-l-amber-500",
};

const ICON_COLORS: Record<Toast["type"], string> = {
  success: "text-green-500",
  error:   "text-red-500",
  info:    "text-blue-500",
  warning: "text-amber-500",
};

const BAR_COLORS: Record<Toast["type"], string> = {
  success: "bg-green-400",
  error:   "bg-red-400",
  info:    "bg-blue-400",
  warning: "bg-amber-400",
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-4 md:right-6 z-[100] flex flex-col gap-2 pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast:     Toast;
  onDismiss: () => void;
}) {
  const Icon        = ICONS[t.type];
  const barRef      = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !barRef.current) return;
    const el = barRef.current;
    // Start at 100% then animate to 0% over duration
    el.style.width = "100%";
    el.style.transition = "none";
    // Force reflow
    void el.offsetWidth;
    el.style.transition = `width ${t.duration}ms linear`;
    el.style.width = "0%";
  }, [mounted, t.duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{   opacity: 0, y: -8,  scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "relative w-[88vw] max-w-sm shadow-lg overflow-hidden pointer-events-auto",
        STYLES[t.type]
      )}
      role="alert"
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <Icon
          size={16}
          strokeWidth={2}
          className={cn("mt-0.5 shrink-0", ICON_COLORS[t.type])}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-brand-black leading-snug">
            {t.title}
          </p>
          {t.message && (
            <p className="text-xs text-brand-gray-500 mt-0.5 leading-snug">
              {t.message}
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 text-brand-gray-300 hover:text-brand-black transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gray-100">
        <div
          ref={barRef}
          className={cn("h-full", BAR_COLORS[t.type])}
          style={{ width: "100%" }}
        />
      </div>
    </motion.div>
  );
}
