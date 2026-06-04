"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Package, Heart, LogOut, Edit2, CheckCircle2, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/services/auth.service";
import { createClient } from "@/lib/supabase/client";
import { cn, formatPrice, getInitials } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/constants";

type AccountTab = "orders" | "profile" | "wishlist";
const profileSchema = z.object({ full_name: z.string().min(3), phone: z.string().regex(/^(?:\+880|880|0)?1[3-9]\d{8}$/, "Enter a valid BD phone number") });
type PF = z.infer<typeof profileSchema>;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export function AccountClient() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [tab, setTab] = useState<AccountTab>("orders");
  const [orders, setOrders] = useState<{ id: string; order_number: string; status: string; total: number; created_at: string; order_items: {id:string}[] }[]>([]);
  const [ordersLoading, setOL] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saveSuccess, setSaved] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PF>({ resolver: zodResolver(profileSchema) });

  useEffect(() => { if (!loading && !user) router.replace("/login?redirect=/account"); }, [loading, user, router]);
  useEffect(() => { if (profile) reset({ full_name: profile.full_name ?? "", phone: profile.phone ?? "" }); }, [profile, reset]);
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }: { data: typeof orders | null }) => { setOrders((data ?? []) as typeof orders); setOL(false); });
  }, [user]);

  const handleSignOut = async () => { await signOut(); router.push("/"); router.refresh(); };

  const onSave = async (data: PF) => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("profiles").update({ full_name: data.full_name, phone: data.phone }).eq("id", user.id);
    await refreshProfile(); setEditMode(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-brand-gray-200 border-t-brand-black rounded-full animate-spin" /></div>;
  if (!user || !profile) return null;

  const TABS = [{ key: "orders" as AccountTab, label: "My Orders", icon: Package }, { key: "profile" as AccountTab, label: "Profile", icon: User }, { key: "wishlist" as AccountTab, label: "Wishlist", icon: Heart }];

  return (
    <div className="min-h-screen bg-brand-gray-50 py-10 md:py-14">
      <div className="container-brand max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-black rounded-full flex items-center justify-center text-white font-display font-bold text-base">{getInitials(profile.full_name ?? profile.email)}</div>
            <div><p className="font-display font-semibold text-lg text-brand-black leading-tight">{profile.full_name ?? "My Account"}</p><p className="text-xs text-brand-gray-500">{profile.email}</p></div>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-1.5 text-xs text-brand-gray-500 hover:text-brand-black transition-colors"><LogOut size={14} strokeWidth={1.5} /><span className="hidden sm:block">Sign Out</span></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-8">
          <nav className="flex md:flex-col gap-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)} className={cn("flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-all text-left", tab === key ? "bg-brand-black text-white" : "bg-white text-brand-gray-600 hover:text-brand-black border border-brand-gray-100 md:border-transparent")}>
                <Icon size={15} strokeWidth={1.5} />{label}
              </button>
            ))}
          </nav>
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {tab === "orders" && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                  <h2 className="font-display font-semibold text-xl text-brand-black mb-6">Order History</h2>
                  {ordersLoading ? (
                    <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="bg-white border border-brand-gray-100 animate-pulse p-5"><div className="h-3 bg-brand-gray-100 rounded w-24 mb-2" /><div className="h-5 bg-brand-gray-100 rounded w-40" /></div>)}</div>
                  ) : orders.length === 0 ? (
                    <div className="py-16 text-center bg-white border border-brand-gray-100">
                      <Package size={36} strokeWidth={1} className="text-brand-gray-200 mx-auto mb-3" />
                      <p className="font-display font-semibold text-lg text-brand-gray-700 mb-2">No orders yet</p>
                      <p className="text-sm text-brand-gray-400 mb-6">Your orders will appear here after you shop.</p>
                      <Link href="/shop" className="btn-primary inline-flex">Start Shopping</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white border border-brand-gray-100 overflow-hidden">
                          <div className="px-5 py-4 flex items-center justify-between border-b border-brand-gray-100">
                            <div><p className="text-xs text-brand-gray-400 mb-0.5">{new Date(order.created_at).toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric" })}</p><p className="font-display font-semibold text-brand-black tracking-wide">{order.order_number}</p></div>
                            <div className="flex items-center gap-3">
                              <span className={cn("text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 border", STATUS_STYLES[order.status] ?? "bg-brand-gray-100 text-brand-gray-600")}>{ORDER_STATUS_LABELS[order.status]}</span>
                              <Link href={`/track?order=${order.order_number}`} className="text-brand-gray-400 hover:text-brand-black transition-colors"><ChevronRight size={16} strokeWidth={1.5} /></Link>
                            </div>
                          </div>
                          <div className="px-5 py-4 flex items-center justify-between">
                            <p className="text-sm text-brand-gray-600">{order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? "s" : ""} · Cash on Delivery</p>
                            <p className="text-sm font-bold text-brand-black">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
              {tab === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display font-semibold text-xl text-brand-black">Personal Information</h2>
                    {!editMode && <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 text-xs text-brand-gray-500 hover:text-brand-black"><Edit2 size={12} strokeWidth={1.5} />Edit</button>}
                  </div>
                  {saveSuccess && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 mb-5 text-sm text-green-700"><CheckCircle2 size={14} strokeWidth={1.5} />Profile updated successfully!</motion.div>}
                  {editMode ? (
                    <form onSubmit={handleSubmit(onSave)} className="space-y-5">
                      {[{ label: "Full Name", key: "full_name", err: errors.full_name?.message }, { label: "Phone Number", key: "phone", err: errors.phone?.message }].map(({ label, key, err }) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-brand-gray-700 mb-1.5">{label}</label>
                          <input {...register(key as keyof PF)} type="text" className={cn("w-full px-4 py-3 text-sm bg-white border outline-none transition-colors", err ? "border-red-300" : "border-brand-gray-200 focus:border-brand-gray-500")} />
                          {err && <p className="mt-1 text-[11px] text-red-500">{err}</p>}
                        </div>
                      ))}
                      <div><label className="block text-xs font-medium text-brand-gray-700 mb-1.5">Email Address</label><input value={profile.email} disabled className="w-full px-4 py-3 text-sm bg-white border border-brand-gray-200 opacity-50 cursor-not-allowed" /></div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => { setEditMode(false); reset(); }} className="flex-1 btn-outline py-3 text-xs">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-3 text-xs disabled:opacity-60">{isSubmitting ? "Saving…" : "Save Changes"}</button>
                      </div>
                    </form>
                  ) : (
                    <dl className="space-y-5">
                      {[{ label: "Full Name", value: profile.full_name ?? "—" }, { label: "Email Address", value: profile.email }, { label: "Phone Number", value: profile.phone ?? "—" }, { label: "Member Since", value: new Date(profile.created_at).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" }) }].map(({ label, value }) => (
                        <div key={label} className="bg-white px-5 py-4 border border-brand-gray-100">
                          <dt className="text-[10px] font-medium tracking-widest uppercase text-brand-gray-400 mb-1">{label}</dt>
                          <dd className="text-sm font-medium text-brand-black">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </motion.div>
              )}
              {tab === "wishlist" && (
                <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                  <h2 className="font-display font-semibold text-xl text-brand-black mb-6">Saved Items</h2>
                  <div className="py-16 text-center bg-white border border-brand-gray-100">
                    <Heart size={36} strokeWidth={1} className="text-brand-gray-200 mx-auto mb-3" />
                    <p className="font-display font-semibold text-lg text-brand-gray-700 mb-2">Your wishlist is empty</p>
                    <p className="text-sm text-brand-gray-400 mb-6">Save items by tapping the heart icon.</p>
                    <Link href="/shop" className="btn-primary inline-flex">Explore Collection</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
