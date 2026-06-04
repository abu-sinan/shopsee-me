import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "@/features/search/SearchClient";

export const metadata: Metadata = { title: "Search", description: "Search for products on ShopSeeMe.", robots: { index: false, follow: true } };

export default function SearchPage() { return <Suspense><SearchClient /></Suspense>; }
