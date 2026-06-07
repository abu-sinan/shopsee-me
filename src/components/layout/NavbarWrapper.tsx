import { createClient } from "@/lib/supabase/server";
import { Navbar }       from "./Navbar";

export async function NavbarWrapper() {
  let categories: { id: string; name: string; slug: string; parent_id: string | null }[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .order("name");
    categories = (data ?? []) as typeof categories;
  } catch {
    // Supabase not configured - show minimal nav
  }

  return <Navbar navCategories={categories} />;
}
