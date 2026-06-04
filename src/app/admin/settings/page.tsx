import type { Metadata } from "next";
import { createClient }  from "@/lib/supabase/server";
import { AdminSettings } from "@/features/admin/settings/AdminSettings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, email")
    .eq("id", user.id)
    .single();

  return (
    <AdminSettings
      user={user}
      profile={profile ?? { full_name: null, phone: null, email: user.email ?? "" }}
    />
  );
}
