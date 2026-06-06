"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { useRouter }           from "next/navigation";
import Link                    from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm }             from "react-hook-form";
import { zodResolver }         from "@hookform/resolvers/zod";
import { z }                   from "zod";
import { User, Package, Heart, LogOut, Edit2, CheckCircle2, ChevronRight } from "lucide-react";
import { useAuth }             from "@/hooks/useAuth";
import { signOut }             from "@/services/auth.service";
import { createClient }        from "@/lib/supabase/client";
import { cn, formatPrice, getInitials } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/constants";

type AccountTab = "orders" | "profile" | "wishlist";
const profileSchema = z.object({
  full_name: z.string().min(2),
  phone:     z.string().optional(),
});
type PF = z.infer<typeof profileSchema>;

const STATUS_COLORS = {
  pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed:  "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered:  "bg-green-50 text-green-700 border-green-200",
  cancelled:  "bg-red-50 text-red-700 border-red-200",
};

export function AccountClient() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [tab,  setTab]  = useState<AccountTab>("orders");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOL] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saveSuccess, setSaved]  = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<PF>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/account");
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) reset({ full_name: profile.full_name ?? "", phone: profile.phone ?? "" });
  }, [profile, reset]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    // Fetch by user_id OR by phone (handles orders placed before login)
    Promise.all([
      supabase.from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      // Also try fetching by profile phone
      profile?.phone
        ? supabase.from("orders")
            .select("*, order_items(*)")
            .eq("customer_phone", profile.phone)
            .is("user_id", null)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
    ]).then(([byId, byPhone]) => {
      const all = [...(byId.data ?? []), ...(byPhone.data ?? [])];
      // Deduplicate by id
      const seen = new Set();
      const deduped = all.filter((o) => { if (seen.has(o.id)) return false; seen.add(o.id); return true; });
      deduped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(deduped);
      setOL(false);
    });
  }, [user, profile?.phone]);

  const handleSignOut = async () => { await signOut(); router.push("/"); router.refresh(); };

  const onSave = async (data: PF) => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("profiles").update({ full_name: data.full_name, phone: data.phone ?? null }).eq("id", user.id);
    await refreshProfile();
    setEditMode(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand-gray-200 border-t-brand-black rounded-full animate-spin" />
    </div>
  );
  if (!user || !profile) return null;

  const TABS = [
    { key: "orders"  as AccountTab, label: "My Orders", icon: Package },
    { key: "profile" as AccountTab, label: "Profile",   icon: User    },
    { key: "wishlist"as AccountTab, label: "Wishlist",  icon: Heart   },
  ];

  return (
    <div className="min-h-screen bg-brand-gray-50 py-8 md:py-14">
      <div className="container-brand max-w-5xl mx-auto">

        {/* Profile header */}
        <div className="flex items-center justify-between mb-8 bg-white border border-brand-gray-100 px-5 py-5 md:px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-black rounded-full flex items-center justify-center text-white font-display font-semibold text-base shrink-0">
              {getInitials(profile.full_name ?? profile.email)}
            </div>
            <div>
              <p className="font-display font-semibold text-lg text-brand-black leading-tight">
                {profile.full_name ?? "My Account"}
              </p>
              <p className="text-xs text-brand-stone mt-0.5">{profile.email}</p>
            </div>
          </div>
          <button onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-brand-stone hover:text-brand-black transition-colors">
            <LogOut size={14} strokeWidth={1.5} />
            <span className="hidden sm:block">Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5">
          {/* Tab nav */}
          <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible no-scrollbar">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-all text-left whitespace-nowrap shrink-0",
                  tab === key
                    ? "bg-brand-black text-white"
                    : "bg-white text-brand-muted hover:text-brand-black border border-brand-gray-100"
                )}>
                <Icon size={15} strokeWidth={1.5} />{label}
              </button>
            ))}
          </nav>

          {/* Tab content */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* ── Orders ── */}
              {tab === "orders" && (
                <motion.div key="orders"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <h2 className="font-display font-light text-2xl text-brand-black mb-5"
                    style={{ letterSpacing: "-0.02em" }}>Order History</h2>

                  {ordersLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map((i) => (
                        <div key={i} className="bg-white border border-brand-gray-100 animate-pulse p-5">
                          <div className="h-3 bg-brand-gray-100 rounded w-32 mb-2" />
                          <div className="h-5 bg-brand-gray-100 rounded w-48" />
                        </div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-16 text-center bg-white border border-brand-gray-100">
                      <Package size={36} strokeWidth={1} className="text-brand-gray-200 mx-auto mb-3" />
                      <p className="font-display font-light text-xl text-brand-dark mb-2">No orders yet</p>
                      <p className="text-sm text-brand-stone mb-6">
                        Orders appear here after checkout.
                      </p>
                      <Link href="/shop" className="btn-primary inline-flex">Start Shopping</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white border border-brand-gray-100 overflow-hidden">
                          <div className="px-5 py-4 flex items-center justify-between border-b border-brand-gray-50">
                            <div>
                              <p className="text-[10px] text-brand-stone mb-0.5">
                                {new Date(order.created_at).toLocaleDateString("en-BD", {
                                  day: "numeric", month: "long", year: "numeric"
                                })}
                              </p>
                              <p className="font-mono text-sm font-semibold text-brand-black tracking-wide">
                                {order.order_number}
                              </p>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className={cn(
                                "text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 border",
                                STATUS_COLORS[order.status] ?? "bg-brand-gray-100 text-brand-gray-600"
                              )}>
                                {ORDER_STATUS_LABELS[order.status] ?? order.status}
                              </span>
                              <Link href={`/track?order=${order.order_number}`}
                                className="text-brand-stone hover:text-brand-black transition-colors">
                                <ChevronRight size={16} strokeWidth={1.5} />
                              </Link>
                            </div>
                          </div>
                          <div className="px-5 py-3.5 flex items-center justify-between">
                            <p className="text-sm text-brand-stone">
                              {order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? "s" : ""}
                              <span className="mx-1.5 text-brand-gray-200">·</span>
                              Cash on Delivery
                            </p>
                            <p className="text-sm font-bold text-brand-black">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Profile ── */}
              {tab === "profile" && (
                <motion.div key="profile"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display font-light text-2xl text-brand-black" style={{ letterSpacing: "-0.02em" }}>
                      Personal Information
                    </h2>
                    {!editMode && (
                      <button onClick={() => setEditMode(true)}
                        className="flex items-center gap-1.5 text-xs text-brand-stone hover:text-brand-black">
                        <Edit2 size={12} strokeWidth={1.5} />Edit
                      </button>
                    )}
                  </div>
                  {saveSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 mb-4 text-sm text-green-700">
                      <CheckCircle2 size={14} strokeWidth={1.5} />Profile updated!
                    </div>
                  )}
                  {editMode ? (
                    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                      {[
                        { label: "Full Name",    k: "full_name", err: errors.full_name?.message },
                        { label: "Phone",        k: "phone",     err: errors.phone?.message     },
                      ].map(({ label, k, err }) => (
                        <div key={k}>
                          <label className="block text-xs font-medium text-brand-stone mb-1.5">{label}</label>
                          <input {...register(k)} type="text"
                            className={cn(
                              "w-full px-4 py-3 text-sm bg-white border outline-none transition-colors",
                              err ? "border-red-300" : "border-brand-gray-200 focus:border-brand-gray-500"
                            )} />
                          {err && <p className="mt-1 text-[11px] text-red-500">{err}</p>}
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-medium text-brand-stone mb-1.5">Email</label>
                        <input value={profile.email} disabled className="w-full px-4 py-3 text-sm bg-white border border-brand-gray-100 opacity-50 cursor-not-allowed" />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => { setEditMode(false); reset(); }}
                          className="flex-1 btn-outline py-3 text-xs">Cancel</button>
                        <button type="submit" disabled={isSubmitting}
                          className="flex-1 btn-primary py-3 text-xs disabled:opacity-60">
                          {isSubmitting ? "Saving…" : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <dl className="space-y-3">
                      {[
                        { label: "Full Name", value: profile.full_name ?? "—" },
                        { label: "Email",     value: profile.email             },
                        { label: "Phone",     value: profile.phone ?? "—"      },
                        { label: "Member Since", value: new Date(profile.created_at).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" }) },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white px-5 py-4 border border-brand-gray-100">
                          <dt className="text-[10px] font-medium tracking-widest uppercase text-brand-stone mb-1">{label}</dt>
                          <dd className="text-sm font-medium text-brand-black">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </motion.div>
              )}

              {/* ── Wishlist ── */}
              {tab === "wishlist" && (
                <motion.div key="wishlist"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  <h2 className="font-display font-light text-2xl text-brand-black mb-5"
                    style={{ letterSpacing: "-0.02em" }}>Saved Items</h2>
                  <div className="py-16 text-center bg-white border border-brand-gray-100">
                    <Heart size={36} strokeWidth={1} className="text-brand-gray-200 mx-auto mb-3" />
                    <p className="font-display font-light text-xl text-brand-dark mb-2">View your wishlist</p>
                    <p className="text-sm text-brand-stone mb-6">All your saved items are on the wishlist page.</p>
                    <Link href="/wishlist" className="btn-primary inline-flex">Go to Wishlist</Link>
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
