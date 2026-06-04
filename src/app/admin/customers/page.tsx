import type { Metadata } from "next";
import { createClient }  from "@/lib/supabase/server";
import { formatPrice }   from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Customers" };

interface CustomerRow {
  id:         string;
  email:      string;
  full_name:  string | null;
  phone:      string | null;
  created_at: string;
}

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  const rows = (customers ?? []) as CustomerRow[];

  return (
    <div className="space-y-5">
      <p className="text-sm text-brand-gray-500">
        {rows.length} customer{rows.length !== 1 ? "s" : ""}
      </p>

      <div className="bg-white border border-brand-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-gray-100">
              {["Name", "Email", "Phone", "Joined"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[10px] font-semibold tracking-widest uppercase text-brand-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center text-sm text-brand-gray-400">
                  No customers yet
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-brand-gray-50 hover:bg-brand-gray-50 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-brand-black">
                    {c.full_name ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-brand-gray-600">{c.email}</td>
                  <td className="px-5 py-3.5 text-brand-gray-600">{c.phone ?? "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-brand-gray-400">
                    {new Date(c.created_at).toLocaleDateString("en-BD", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
