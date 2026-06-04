import type { ReactNode }  from "react";
import { redirect }        from "next/navigation";
import { createClient }    from "@/lib/supabase/server";
import { AdminSidebar }    from "@/features/admin/components/AdminSidebar";
import { AdminHeader }     from "@/features/admin/components/AdminHeader";

export const dynamic = "force-dynamic";

async function getAdminUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, email")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") return null;
    return { user, profile };
  } catch {
    return null;
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/login");

  return (
    <div className="min-h-dvh bg-[#F7F6F4] flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
