import { NextResponse } from "next/server";
import { createClient }      from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/account/claim-orders
 * Links orphaned guest orders (user_id = null) to the authenticated user
 * by matching customer_phone.  Uses the service-role client so it can
 * UPDATE rows that RLS would otherwise block.
 */
export async function POST() {
  try {
    // 1. Verify auth via the user's session
    const userSupabase = await createClient();
    const { data: { user }, error: authErr } = await userSupabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get user's phone from their profile
    const { data: profile } = await userSupabase
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .single();

    if (!profile?.phone) {
      return NextResponse.json({ claimed: 0 });
    }

    // 3. Build phone variants (handles +880, 880, 0 prefix)
    const raw    = profile.phone.replace(/[\s\-()]/g, "");
    const digits = raw.replace(/^\+/, "");
    const local  = digits.replace(/^880/, "0");
    const phones = Array.from(new Set([raw, `+${digits}`, digits, local]));

    // 4. Use service-role to bypass RLS for the UPDATE
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ claimed: 0, note: "Service key not configured" });
    }

    // Find orphaned orders matching any phone variant
    const { data: orphans } = await admin
      .from("orders")
      .select("id")
      .is("user_id", null)
      .in("customer_phone", phones);

    if (!orphans || orphans.length === 0) {
      return NextResponse.json({ claimed: 0 });
    }

    const ids = orphans.map((o: { id: string }) => o.id);

    // Claim them
    const { error: updateErr } = await admin
      .from("orders")
      .update({ user_id: user.id })
      .in("id", ids);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ claimed: ids.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
