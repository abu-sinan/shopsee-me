import type { Metadata } from "next";
import { AccountClient } from "@/features/account/AccountClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

export default function AccountPage() { return <AccountClient />; }
