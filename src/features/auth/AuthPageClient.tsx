"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { loginSchema, registerSchema, forgotPasswordSchema, type LoginFormValues, type RegisterFormValues, type ForgotPasswordFormValues } from "@/lib/validations/auth.schema";
import { signIn, signUp, sendPasswordReset } from "@/services/auth.service";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/constants";

type AuthMode = "login" | "register" | "forgot";

export function AuthPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/account";
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => { setServerError(null); setSuccessMsg(null); }, [mode]);

  const loginForm = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const onLogin = async (data: LoginFormValues) => {
    setSubmitting(true); setServerError(null);
    const result = await signIn(data);
    setSubmitting(false);
    if (!result.success) { setServerError(result.error ?? "Login failed"); return; }
    router.push(redirect); router.refresh();
  };

  const registerForm = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });
  const onRegister = async (data: RegisterFormValues) => {
    setSubmitting(true); setServerError(null);
    const result = await signUp(data);
    setSubmitting(false);
    if (!result.success) { setServerError(result.error ?? "Registration failed"); return; }
    setSuccessMsg("Account created! Please check your email to verify, then log in.");
    setTimeout(() => setMode("login"), 3000);
  };

  const forgotForm = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });
  const onForgot = async (data: ForgotPasswordFormValues) => {
    setSubmitting(true); setServerError(null);
    const result = await sendPasswordReset(data.email);
    setSubmitting(false);
    if (!result.success) { setServerError(result.error ?? "Failed to send reset email"); return; }
    setSuccessMsg("Password reset link sent! Check your inbox.");
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-black relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <Link href="/" className="font-display font-bold text-3xl text-white hover:opacity-70 transition-opacity mb-16">{SITE_CONFIG.name}</Link>
          <blockquote className="font-display text-4xl font-bold text-white leading-tight tracking-tight max-w-xs text-balance">&ldquo;Style is a way to say who you are without having to speak.&rdquo;</blockquote>
          <p className="mt-6 text-sm text-white/40 tracking-widest">— Rachel Zoe</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-brand-gray-100">
          <Link href="/" className="font-display font-bold text-xl text-brand-black">{SITE_CONFIG.name}</Link>
          <Link href="/" className="flex items-center gap-1 text-xs text-brand-gray-500 hover:text-brand-black"><ArrowLeft size={12} strokeWidth={1.5} />Back</Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="flex gap-6 mb-8 border-b border-brand-gray-100">
              {(["login", "register"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={cn("pb-3 text-sm font-medium capitalize tracking-wide transition-all border-b-2 -mb-px", mode === m ? "border-brand-black text-brand-black" : "border-transparent text-brand-gray-400 hover:text-brand-gray-700")}>
                  {m === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {successMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 mb-6"><CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" strokeWidth={1.5} /><p className="text-sm text-green-700">{successMsg}</p></motion.div>}
              {serverError && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-red-50 border border-red-200 mb-6"><p className="text-sm text-red-600">{serverError}</p></motion.div>}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {mode === "login" && (
                <motion.form key="login" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.25 }} onSubmit={loginForm.handleSubmit(onLogin)} noValidate className="space-y-5">
                  <AField label="Email Address" error={loginForm.formState.errors.email?.message}><input {...loginForm.register("email")} type="email" placeholder="you@example.com" autoComplete="email" className={ai(!!loginForm.formState.errors.email)} /></AField>
                  <AField label="Password" error={loginForm.formState.errors.password?.message}>
                    <div className="relative">
                      <input {...loginForm.register("password")} type={showPwd ? "text" : "password"} placeholder="Your password" autoComplete="current-password" className={cn(ai(!!loginForm.formState.errors.password), "pr-10")} />
                      <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-gray-700">{showPwd ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}</button>
                    </div>
                  </AField>
                  <div className="text-right"><button type="button" onClick={() => setMode("forgot")} className="text-xs text-brand-gray-500 hover:text-brand-black transition-colors underline underline-offset-2">Forgot password?</button></div>
                  <SubmitBtn loading={isSubmitting} label="Sign In" />
                  <p className="text-center text-xs text-brand-gray-500">Don&apos;t have an account? <button type="button" onClick={() => setMode("register")} className="font-medium text-brand-black underline underline-offset-2">Create one</button></p>
                </motion.form>
              )}
              {mode === "register" && (
                <motion.form key="register" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} onSubmit={registerForm.handleSubmit(onRegister)} noValidate className="space-y-4">
                  <AField label="Full Name" error={registerForm.formState.errors.full_name?.message}><input {...registerForm.register("full_name")} type="text" placeholder="e.g. Rahim Uddin" autoComplete="name" className={ai(!!registerForm.formState.errors.full_name)} /></AField>
                  <AField label="Email Address" error={registerForm.formState.errors.email?.message}><input {...registerForm.register("email")} type="email" placeholder="you@example.com" autoComplete="email" className={ai(!!registerForm.formState.errors.email)} /></AField>
                  <AField label="Phone Number" error={registerForm.formState.errors.phone?.message}><input {...registerForm.register("phone")} type="tel" placeholder="01712345678" autoComplete="tel" inputMode="numeric" className={ai(!!registerForm.formState.errors.phone)} /></AField>
                  <AField label="Password" error={registerForm.formState.errors.password?.message}>
                    <div className="relative">
                      <input {...registerForm.register("password")} type={showPwd ? "text" : "password"} placeholder="Min. 8 characters" autoComplete="new-password" className={cn(ai(!!registerForm.formState.errors.password), "pr-10")} />
                      <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400">{showPwd ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}</button>
                    </div>
                  </AField>
                  <AField label="Confirm Password" error={registerForm.formState.errors.confirm_password?.message}>
                    <div className="relative">
                      <input {...registerForm.register("confirm_password")} type={showConf ? "text" : "password"} placeholder="Repeat password" autoComplete="new-password" className={cn(ai(!!registerForm.formState.errors.confirm_password), "pr-10")} />
                      <button type="button" onClick={() => setShowConf((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400">{showConf ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}</button>
                    </div>
                  </AField>
                  <SubmitBtn loading={isSubmitting} label="Create Account" />
                  <p className="text-center text-xs text-brand-gray-500">Already have an account? <button type="button" onClick={() => setMode("login")} className="font-medium text-brand-black underline underline-offset-2">Sign in</button></p>
                </motion.form>
              )}
              {mode === "forgot" && (
                <motion.form key="forgot" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} onSubmit={forgotForm.handleSubmit(onForgot)} noValidate className="space-y-5">
                  <div className="mb-2"><h2 className="font-display font-semibold text-xl text-brand-black mb-1">Reset Password</h2><p className="text-sm text-brand-gray-500">Enter your email and we&apos;ll send a reset link.</p></div>
                  <AField label="Email Address" error={forgotForm.formState.errors.email?.message}><input {...forgotForm.register("email")} type="email" placeholder="you@example.com" autoComplete="email" className={ai(!!forgotForm.formState.errors.email)} /></AField>
                  <SubmitBtn loading={isSubmitting} label="Send Reset Link" />
                  <button type="button" onClick={() => setMode("login")} className="flex items-center gap-1.5 text-xs text-brand-gray-500 hover:text-brand-black transition-colors"><ArrowLeft size={12} strokeWidth={1.5} />Back to sign in</button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function AField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-brand-gray-700 mb-1.5 tracking-wide">{label}</label>
      {children}
      {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-[11px] text-red-500">{error}</motion.p>}
    </div>
  );
}
function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-3.5 disabled:opacity-60">
      {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Please wait…</span> : label}
    </button>
  );
}
function ai(hasError: boolean) {
  return cn("w-full px-4 py-3 text-sm text-brand-black bg-brand-white border outline-none transition-colors placeholder:text-brand-gray-300", hasError ? "border-red-300 focus:border-red-400" : "border-brand-gray-200 focus:border-brand-gray-500");
}
