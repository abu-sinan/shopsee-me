import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageClient } from "@/features/auth/AuthPageClient";

export const metadata: Metadata = { title: "Login or Register", robots: { index: false, follow: false } };

export default function LoginPage() { return <Suspense><AuthPageClient /></Suspense>; }
