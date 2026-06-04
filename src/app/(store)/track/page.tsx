import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackClient } from "@/features/order/TrackClient";

export const metadata: Metadata = { title: "Track Your Order", description: "Enter your order number to track your ShopSeeMe delivery." };

export default function TrackPage() { return <Suspense><TrackClient /></Suspense>; }
