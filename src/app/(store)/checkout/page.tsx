import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutClient } from "@/features/checkout/CheckoutClient";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default function CheckoutPage() { return <Suspense><CheckoutClient /></Suspense>; }
