import type { ReactNode } from "react";
import { Navbar }         from "@/components/layout/Navbar";
import { Footer }         from "@/components/layout/Footer";
import { CartDrawer }     from "@/components/cart/CartDrawer";
import { ChatWidget }     from "@/components/chat/ChatWidget";
import { StoreHydration } from "@/components/shared/StoreHydration";
import { createClient }   from "@/lib/supabase/server";
import type { NavItem, Category } from "@/types";

/** Build hierarchical NavItem[] from flat Category[] */
function buildNavItems(categories: Category[]): NavItem[] {
  const topLevel = categories.filter((c) => !c.parent_id);
  const items: NavItem[] = topLevel.map((parent) => {
    const children = categories.filter((c) => c.parent_id === parent.id);
    const childItems: NavItem[] = children.map((c) => ({
      label: c.name,
      href: `/${parent.slug}/${c.slug}`,
    }));
    // Add an "All <Parent>" link as the last child
    if (childItems.length > 0) {
      childItems.push({ label: `All ${parent.name}`, href: `/${parent.slug}` });
    }
    return {
      label: parent.name,
      href: `/${parent.slug}`,
      children: childItems.length > 0 ? childItems : undefined,
    };
  });

  // Always append Sale at the end
  items.push({ label: "Sale", href: "/sale" });
  return items;
}

export default async function StoreLayout({ children }: { children: ReactNode }) {
  // Fetch categories from Supabase — gracefully fall back to empty on error
  let navItems: NavItem[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });
    if (data && data.length > 0) {
      navItems = buildNavItems(data as Category[]);
    }
  } catch {
    // silently fall back — nav still renders, just empty until DB is reachable
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <StoreHydration />
      <Navbar navItems={navItems} />
      <main className="flex-1" style={{ paddingTop: "var(--nav-height)" }}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </div>
  );
}
