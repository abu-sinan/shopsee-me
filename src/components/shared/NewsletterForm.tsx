"use client";

import { useState } from "react";
import { useForm }  from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z }        from "zod";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});
type FormValues = z.infer<typeof schema>;

export function NewsletterForm({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [done, setDone] = useState(false);
  const isDark = variant === "dark";

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (_: FormValues) => {
    await new Promise((r) => setTimeout(r, 700));
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex items-center gap-2.5 text-sm">
        <div className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center",
          isDark ? "bg-white/10" : "bg-brand-black"
        )}>
          <Check size={11} strokeWidth={2.5} className={isDark ? "text-white" : "text-white"} />
        </div>
        <span className={isDark ? "text-white/60" : "text-brand-muted"}>
          You&apos;re on the list — thank you!
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className={cn(
        "flex items-center border-b transition-colors",
        isDark
          ? "border-white/15 focus-within:border-white/40"
          : "border-brand-gray-300 focus-within:border-brand-black"
      )}>
        <input
          {...register("email")}
          type="email"
          placeholder="Your email address"
          autoComplete="email"
          className={cn(
            "flex-1 bg-transparent py-3 text-sm outline-none",
            isDark
              ? "text-white placeholder:text-white/25"
              : "text-brand-black placeholder:text-brand-stone"
          )}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "p-2 transition-all disabled:opacity-40",
            isDark
              ? "text-white/30 hover:text-white"
              : "text-brand-stone hover:text-brand-black"
          )}
          aria-label="Subscribe"
        >
          {isSubmitting
            ? <span className="w-4 h-4 border-2 border-current/20 border-t-current rounded-full animate-spin block" />
            : <ArrowRight size={15} strokeWidth={1.5} />}
        </button>
      </div>
      {errors.email && (
        <p className={cn("mt-2 text-[11px]", isDark ? "text-red-400" : "text-red-500")}>
          {errors.email.message}
        </p>
      )}
    </form>
  );
}
