import { createClient } from "@/lib/supabase/server";
import { Navbar }       from "./Navbar";

export async function NavbarWrapper() {
  let navCategories: { id: string; name: string; slug: string; parent_id: string | null }[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .order("name");
    navCategories = data ?? [];
  } catch {
    // Supabase not configured yet - use empty array
    navCategories = [];
  }
  return <Navbar navCategories={navCategories} />;
}
