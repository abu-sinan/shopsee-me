import type { Metadata }             from "next";
import { createClient }              from "@/lib/supabase/server";
import { AdminCategoriesClient }     from "@/features/admin/categories/AdminCategoriesClient";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data }  = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, image_url, description")
    .order("name");

  const categories = (data ?? []) as {
    id: string; name: string; slug: string;
    parent_id: string | null; image_url?: string | null; description?: string | null;
  }[];

  return <AdminCategoriesClient initialCategories={categories} />;
}
