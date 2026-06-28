import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type BrokerRow = {
  id: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  states: string[];
  status: string | null;
  created_at: string | null;
  last_active: string | null;
  inventory: number;
  // MB used (R2 storage) — not yet wired; photos live in Cloudflare R2, not
  // Postgres, so this needs a separate R2-prefix sum. null = "—" for now.
  mb_used: number | null;
};

export type Overview = {
  brokers: BrokerRow[];
  totals: {
    brokers: number;
    approved: number;
    pending: number;
    properties: number;
  };
};

export async function fetchOverview(): Promise<Overview> {
  const sb = supabaseAdmin();

  const [usersRes, propsRes] = await Promise.all([
    sb
      .from("users")
      .select(
        "id, name, first_name, last_name, company, phone, states, status, created_at, last_active",
      )
      .order("created_at", { ascending: false }),
    sb.from("properties").select("user_id"),
  ]);

  if (usersRes.error) throw usersRes.error;
  if (propsRes.error) throw propsRes.error;

  const counts = new Map<string, number>();
  for (const p of propsRes.data ?? []) {
    const uid = (p as { user_id: string }).user_id;
    counts.set(uid, (counts.get(uid) ?? 0) + 1);
  }

  const brokers: BrokerRow[] = (usersRes.data ?? []).map((u) => {
    const row = u as {
      id: string;
      name: string | null;
      first_name: string | null;
      last_name: string | null;
      company: string | null;
      phone: string | null;
      states: string[] | null;
      status: string | null;
      created_at: string | null;
      last_active: string | null;
    };
    const full =
      [row.first_name, row.last_name].filter(Boolean).join(" ").trim() ||
      row.name ||
      null;
    return {
      id: row.id,
      name: full,
      company: row.company,
      phone: row.phone,
      states: row.states ?? [],
      status: row.status,
      created_at: row.created_at,
      last_active: row.last_active,
      inventory: counts.get(row.id) ?? 0,
      mb_used: null,
    };
  });

  const approved = brokers.filter((b) => b.status === "approved").length;
  const pending = brokers.filter((b) => b.status === "pending").length;

  return {
    brokers,
    totals: {
      brokers: brokers.length,
      approved,
      pending,
      properties: propsRes.data?.length ?? 0,
    },
  };
}
