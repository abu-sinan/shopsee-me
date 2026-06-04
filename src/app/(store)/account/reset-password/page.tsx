// @ts-nocheck
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/constants";

const schema = z.object({
  password: z.string().min(8, "Min 8 characters").regex(/[A-Z]/, "Include uppercase").regex(/[0-9]/, "Include a number"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPwd, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: data.password });
    if (updateError) { setError(updateError.message); return; }
    setDone(true);
    setTimeout(() => router.push("/account"), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-brand-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display font-bold text-2xl text-brand-black mb-1">{SITE_CONFIG.name}</p>
          <p className="label-caps text-brand-gray-500">Set New Password</p>
        </div>
        <div className="bg-white border border-brand-gray-200 p-8">
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <CheckCircle2 size={40} strokeWidth={1.5} className="text-green-500 mx-auto mb-3" />
              <p className="font-display font-semibold text-brand-black">Password Updated!</p>
              <p className="text-sm text-brand-gray-500 mt-1">Redirecting to your account…</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {error && <p className="p-3 bg-red-50 border border-red-200 text-sm text-red-600">{error}</p>}
              <div>
                <label className="block text-xs font-medium text-brand-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input {...register("password")} type={showPwd ? "text" : "password"} placeholder="Min. 8 characters" autoComplete="new-password"
                    className={cn("w-full px-4 py-3 pr-10 text-sm border outline-none transition-colors", errors.password ? "border-red-300" : "border-brand-gray-200 focus:border-brand-gray-500")} />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400">
                    {showPwd ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-[11px] text-red-500">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-gray-700 mb-1.5">Confirm Password</label>
                <input {...register("confirm")} type="password" placeholder="Repeat password" autoComplete="new-password"
                  className={cn("w-full px-4 py-3 text-sm border outline-none transition-colors", errors.confirm ? "border-red-300" : "border-brand-gray-200 focus:border-brand-gray-500")} />
                {errors.confirm && <p className="mt-1 text-[11px] text-red-500">{errors.confirm.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full btn-primary justify-center py-3.5 disabled:opacity-60">
                {isSubmitting ? "Updating…" : "Set New Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
