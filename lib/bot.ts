import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type Capture = {
  id: string;
  captured_at: string | null;
  group_name: string | null;
  sender_name: string | null;
  contact_phone: string | null;
  kind: string | null; // oferta / demanda / ruido
  review_status: string | null;
  image_count: number;
  promoted: boolean;
  title: string | null;
  price: number | null;
  currency: string | null;
  property_type: string | null;
  operation: string | null;
  location: string | null;
  body_preview: string | null;
};

export type BotMonitor = {
  captures: Capture[];
  kpis: {
    total: number;
    promoted: number;
    pending: number;
    oferta: number;
    demanda: number;
  };
  lastCapturedAt: string | null;
};

export async function fetchBotMonitor(): Promise<BotMonitor> {
  const sb = supabaseAdmin();

  const [waRes, promoRes] = await Promise.all([
    sb
      .from("wa_listings")
      .select(
        "id, captured_at, group_name, sender_name, contact_phone, kind, review_status, images, extracted, body",
      )
      .order("captured_at", { ascending: false }),
    sb.from("properties").select("wa_listing_id").eq("source", "whatsapp"),
  ]);
  if (waRes.error) throw waRes.error;
  if (promoRes.error) throw promoRes.error;

  const promoted = new Set(
    (promoRes.data ?? [])
      .map((p) => (p as { wa_listing_id: string | null }).wa_listing_id)
      .filter(Boolean) as string[],
  );

  const captures: Capture[] = (waRes.data ?? []).map((row) => {
    const r = row as {
      id: string;
      captured_at: string | null;
      group_name: string | null;
      sender_name: string | null;
      contact_phone: string | null;
      kind: string | null;
      review_status: string | null;
      images: unknown;
      extracted: Record<string, unknown> | null;
      body: string | null;
    };
    const ex = r.extracted ?? {};
    const num = (v: unknown) => (typeof v === "number" ? v : null);
    const str = (v: unknown) => (typeof v === "string" ? v : null);
    const body = typeof r.body === "string" ? r.body.replace(/\s+/g, " ").trim() : "";
    return {
      id: r.id,
      captured_at: r.captured_at,
      group_name: r.group_name,
      sender_name: r.sender_name,
      contact_phone: r.contact_phone,
      kind: r.kind,
      review_status: r.review_status,
      image_count: Array.isArray(r.images) ? r.images.length : 0,
      promoted: promoted.has(r.id),
      title: str(ex.title),
      price: num(ex.price),
      currency: str(ex.currency),
      property_type: str(ex.property_type),
      operation: str(ex.operation),
      location: str(ex.location),
      body_preview: body ? body.slice(0, 180) : null,
    };
  });

  return {
    captures,
    kpis: {
      total: captures.length,
      promoted: captures.filter((c) => c.promoted).length,
      pending: captures.filter((c) => c.review_status === "pending").length,
      oferta: captures.filter((c) => c.kind === "oferta").length,
      demanda: captures.filter((c) => c.kind === "demanda").length,
    },
    lastCapturedAt: captures[0]?.captured_at ?? null,
  };
}
