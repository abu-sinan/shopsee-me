import { createClient } from "@/lib/supabase/server";
import { AdminCategoriesClient } from "@/features/admin/categories/AdminCategoriesClient";
import type { Category } from "@/types";

export const dynamic = "force-dynamic";

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return (data ?? []) as Category[];
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return <AdminCategoriesClient initialCategories={categories} />;
}
