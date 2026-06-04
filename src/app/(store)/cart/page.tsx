import type { Metadata } from "next";
import { CartPageClient } from "@/features/cart/CartPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Your Bag", robots: { index: false, follow: false } };

export default function CartPage() { return <CartPageClient />; }
