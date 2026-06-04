import type { Metadata } from "next";
import { Suspense }      from "react";
import { AdminMessagesClient } from "@/features/admin/messages/AdminMessagesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Messages" };

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={
      <div className="h-64 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-gray-200 border-t-brand-black rounded-full animate-spin" />
      </div>
    }>
      <AdminMessagesClient />
    </Suspense>
  );
}
