"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Store, Bell, Shield, Globe } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/store/toast.store";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/constants";

const profileSchema = z.object({ full_name: z.string().min(2), phone: z.string().optional() });
const passwordSchema = z.object({ new_password: z.string().min(8), confirm_password: z.string() }).refine((d) => d.new_password === d.confirm_password, { message: "Passwords do not match", path: ["confirm_password"] });
type PV = z.infer<typeof profileSchema>;
type PWV = z.infer<typeof passwordSchema>;
type SettingsTab = "profile"|"notifications"|"security"|"store";
const TABS = [{ key:"profile" as SettingsTab, label:"Profile", icon:Store }, { key:"notifications" as SettingsTab, label:"Notifications", icon:Bell }, { key:"security" as SettingsTab, label:"Security", icon:Shield }, { key:"store" as SettingsTab, label:"Store Info", icon:Globe }];

export function AdminSettings({ user, profile }: { user: User; profile: { full_name: string | null; phone: string | null; email: string } | null }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const profileForm = useForm<PV>({ resolver: zodResolver(profileSchema), defaultValues: { full_name: profile?.full_name ?? "", phone: profile?.phone ?? "" } });
  const passwordForm = useForm<PWV>({ resolver: zodResolver(passwordSchema) });

  const onSaveProfile = async (data: PV) => {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ full_name: data.full_name, phone: data.phone ?? null }).eq("id", user.id);
    if (error) { toast.error("Failed to update profile", error.message); return; }
    toast.success("Profile updated");
  };

  const onChangePassword = async (data: PWV) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.new_password });
    if (error) { toast.error("Password update failed", error.message); return; }
    toast.success("Password changed"); passwordForm.reset();
  };

  const si = (hasError: boolean) => cn("w-full px-4 py-3 text-sm bg-white border outline-none transition-colors", hasError ? "border-red-300 focus:border-red-400" : "border-brand-gray-200 focus:border-brand-gray-400");

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 max-w-3xl">
      <nav className="flex md:flex-col gap-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)} className={cn("flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-all text-left", activeTab === key ? "bg-brand-black text-white" : "bg-white border border-brand-gray-100 text-brand-gray-600 hover:text-brand-black md:border-transparent")}>
            <Icon size={14} strokeWidth={1.5} />{label}
          </button>
        ))}
      </nav>
      <div className="bg-white border border-brand-gray-200 p-6 md:p-8">
        {activeTab === "profile" && (
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-5">
            <h2 className="font-display font-semibold text-lg text-brand-black mb-6">Admin Profile</h2>
            <div><label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Full Name</label><input {...profileForm.register("full_name")} className={si(!!profileForm.formState.errors.full_name)} />{profileForm.formState.errors.full_name && <p className="mt-1 text-[11px] text-red-500">{profileForm.formState.errors.full_name.message}</p>}</div>
            <div><label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Email Address</label><input value={user.email ?? ""} disabled className={cn(si(false), "opacity-50 cursor-not-allowed")} /><p className="text-[11px] text-brand-gray-400 mt-1">Email cannot be changed here.</p></div>
            <div><label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Phone</label><input {...profileForm.register("phone")} type="tel" placeholder="01712345678" className={si(false)} /></div>
            <button type="submit" disabled={profileForm.formState.isSubmitting} className="btn-primary py-3 text-xs disabled:opacity-60">{profileForm.formState.isSubmitting ? "Saving…" : "Save Profile"}</button>
          </form>
        )}
        {activeTab === "security" && (
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-5">
            <h2 className="font-display font-semibold text-lg text-brand-black mb-6">Change Password</h2>
            <div><label className="block text-xs font-medium text-brand-gray-600 mb-1.5">New Password</label><input {...passwordForm.register("new_password")} type="password" placeholder="Min. 8 characters" autoComplete="new-password" className={si(!!passwordForm.formState.errors.new_password)} />{passwordForm.formState.errors.new_password && <p className="mt-1 text-[11px] text-red-500">{passwordForm.formState.errors.new_password.message}</p>}</div>
            <div><label className="block text-xs font-medium text-brand-gray-600 mb-1.5">Confirm New Password</label><input {...passwordForm.register("confirm_password")} type="password" autoComplete="new-password" className={si(!!passwordForm.formState.errors.confirm_password)} />{passwordForm.formState.errors.confirm_password && <p className="mt-1 text-[11px] text-red-500">{passwordForm.formState.errors.confirm_password.message}</p>}</div>
            <button type="submit" disabled={passwordForm.formState.isSubmitting} className="btn-primary py-3 text-xs disabled:opacity-60">{passwordForm.formState.isSubmitting ? "Updating…" : "Change Password"}</button>
          </form>
        )}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h2 className="font-display font-semibold text-lg text-brand-black mb-6">Notification Preferences</h2>
            {[{ label:"New Orders", sub:"Get notified when a new order is placed", on:true }, { label:"New Messages", sub:"Customer chat messages and inquiries", on:true }, { label:"Low Stock Alerts", sub:"When a variant has less than 5 items", on:true }, { label:"Order Status Updates", sub:"When order status changes", on:false }].map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4">
                <div><p className="text-sm font-medium text-brand-black">{item.label}</p><p className="text-xs text-brand-gray-500 mt-0.5">{item.sub}</p></div>
                <Toggle defaultChecked={item.on} />
              </div>
            ))}
          </div>
        )}
        {activeTab === "store" && (
          <div className="space-y-5">
            <h2 className="font-display font-semibold text-lg text-brand-black mb-6">Store Information</h2>
            {[{ label:"Store Name", value:SITE_CONFIG.name }, { label:"Website URL", value:SITE_CONFIG.url }, { label:"Support Email", value:SITE_CONFIG.email }, { label:"Phone", value:SITE_CONFIG.phone }, { label:"Currency", value:"BDT (Bangladeshi Taka)" }, { label:"Country", value:"Bangladesh" }].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-4 py-3 border-b border-brand-gray-50 last:border-0">
                <span className="text-xs font-medium text-brand-gray-500 w-32 shrink-0 mt-0.5">{label}</span>
                <span className="text-sm text-brand-black">{value}</span>
              </div>
            ))}
            <p className="text-xs text-brand-gray-400 pt-2">To update store info, edit <code className="bg-brand-gray-100 px-1.5 py-0.5">src/constants/index.ts</code></p>
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({ defaultChecked }: { defaultChecked: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button type="button" onClick={() => setOn((v) => !v)} className={cn("relative w-10 rounded-full transition-colors duration-200 shrink-0", on ? "bg-brand-black" : "bg-brand-gray-200")} style={{ height: "22px" }} aria-pressed={on}>
      <motion.div animate={{ x: on ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm" />
    </button>
  );
}
