import type { ReactNode }    from "react";
import { NavbarWrapper }     from "@/components/layout/NavbarWrapper";
import { Footer }            from "@/components/layout/Footer";
import { CartDrawer }        from "@/components/cart/CartDrawer";
import { ChatWidget }        from "@/components/chat/ChatWidget";
import { StoreHydration }    from "@/components/shared/StoreHydration";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <StoreHydration />
      <NavbarWrapper />
      {/* 3.5rem mobile / 4rem desktop */}
      <main className="flex-1 pt-14 md:pt-16">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </div>
  );
}
