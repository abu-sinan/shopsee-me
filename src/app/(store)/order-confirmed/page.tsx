import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmedClient } from "@/features/checkout/OrderConfirmedClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Order Confirmed", robots: { index: false, follow: false } };

export default function OrderConfirmedPage() { return <Suspense><OrderConfirmedClient /></Suspense>; }
