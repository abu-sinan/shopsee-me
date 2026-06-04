import type { ReactNode }   from "react";
import { Navbar }           from "@/components/layout/Navbar";
import { Footer }           from "@/components/layout/Footer";
import { CartDrawer }       from "@/components/cart/CartDrawer";
import { ChatWidget }       from "@/components/chat/ChatWidget";
import { StoreHydration }   from "@/components/shared/StoreHydration";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <StoreHydration />
      <Navbar />
      {/* Account for announcement bar (36px) + nav (56px) = 92px */}
      <main className="flex-1" style={{ paddingTop: "var(--header-total)" }}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </div>
  );
}
