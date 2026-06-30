import { fetchBotMonitor, type BotMonitor, type Capture } from "@/lib/bot";
import { TopNav } from "@/components/TopNav";
import { requireRole } from "@/lib/session";
import { relative } from "@/lib/format";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  casa: "Casa",
  departamento: "Depto",
  terreno: "Terreno",
  oficina: "Oficina",
  local: "Local",
  bodega: "Bodega",
  nave: "Nave",
};

const money = (p: number | null, c: string | null) =>
  p == null ? null : `$${p.toLocaleString("en-US")}${c ? ` ${c}` : ""}`;

const DAY = 86400000;

export default async function WhatsAppPage() {
  await requireRole("dev"); // técnico only

  let data: BotMonitor;
  try {
    data = await fetchBotMonitor();
  } catch (e) {
    return (
      <div className="min-h-screen">
        <TopNav active="whatsapp" />
        <main className="mx-auto max-w-2xl p-8">
          <h1 className="text-xl font-semibold text-rose-600">No se pudo cargar</h1>
          <p className="mt-2 text-sm text-neutral-600">
            {e instanceof Error ? e.message : "Error desconocido."}
          </p>
        </main>
      </div>
    );
  }

  const { captures, kpis, lastCapturedAt } = data;
  const ageMs = lastCapturedAt ? Date.now() - new Date(lastCapturedAt).getTime() : null;
  const stale = ageMs == null || ageMs > DAY;
  const lastLabel = relative(lastCapturedAt).label;

  return (
    <div className="min-h-screen">
      <TopNav active="whatsapp" />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            WhatsApp · Bot
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Capturas del bot y su promoción al inventario.
          </p>
        </div>

        {/* liveness banner */}
        <div
          className={`mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3 ${
            stale
              ? "border-amber-200 bg-amber-50"
              : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
              stale ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${stale ? "bg-amber-500" : "bg-emerald-500"}`} />
          </span>
          <div>
            <p className={`text-sm font-medium ${stale ? "text-amber-800" : "text-emerald-800"}`}>
              {lastCapturedAt
                ? stale
                  ? `El bot no captura desde hace ${lastLabel.toLowerCase()} — ¿está corriendo?`
                  : `Activo · última captura ${lastLabel.toLowerCase()}`
                : "El bot aún no ha capturado nada."}
            </p>
            <p className="text-xs text-neutral-500">
              La liveness se infiere de la última captura (el bot no manda heartbeat todavía).
            </p>
          </div>
        </div>

        {/* KPIs */}
        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Kpi label="Capturas" value={kpis.total} dot="#1c4588" />
          <Kpi label="Promovidas" value={kpis.promoted} dot="#059669" />
          <Kpi label="Pendientes" value={kpis.pending} dot="#d97706" />
          <Kpi label="Ofertas" value={kpis.oferta} dot="#10b981" />
          <Kpi label="Demandas" value={kpis.demanda} dot="#7c3aed" />
        </section>

        <h2 className="mb-4 text-base font-semibold tracking-tight text-neutral-900">
          Capturas recientes
        </h2>
        {captures.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/50 py-16 text-center text-sm text-neutral-400">
            Sin capturas todavía.
          </div>
        ) : (
          <div className="space-y-3">
            {captures.map((c) => (
              <CaptureCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Kpi({ label, value, dot }: { label: string; value: number; dot: string }) {
  return (
    <div className="rounded-2xl border border-black/[0.05] bg-gradient-to-b from-white to-neutral-50/40 p-4 shadow-soft backdrop-blur-sm">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
        <span className="text-xs text-neutral-500">{label}</span>
      </span>
      <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-neutral-900">
        {value}
      </div>
    </div>
  );
}

function CaptureCard({ c }: { c: Capture }) {
  const kindMeta =
    c.kind === "oferta"
      ? { label: "Oferta", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" }
      : c.kind === "demanda"
        ? { label: "Demanda", cls: "bg-amber-50 text-amber-700 ring-amber-200" }
        : { label: c.kind ?? "—", cls: "bg-neutral-100 text-neutral-600 ring-neutral-200" };
  const typeLabel = c.property_type ? (TYPE_LABELS[c.property_type] ?? c.property_type) : null;
  const sub = [typeLabel, c.operation === "renta" ? "Renta" : c.operation === "venta" ? "Venta" : null, c.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="rounded-2xl border border-black/[0.05] bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${kindMeta.cls}`}>
          {kindMeta.label}
        </span>
        {c.promoted ? (
          <span className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-medium text-brand ring-1 ring-inset ring-brand/20">
            ✓ Promovida a propiedad
          </span>
        ) : (
          <span className="rounded-full bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-500 ring-1 ring-inset ring-neutral-200">
            {c.review_status ?? "sin promover"}
          </span>
        )}
        {c.image_count > 0 ? (
          <span className="text-[11px] text-neutral-400">📷 {c.image_count}</span>
        ) : null}
        <span className="ml-auto text-xs text-neutral-400">{relative(c.captured_at).label}</span>
      </div>

      <p className="mt-2 font-medium text-neutral-900">{c.title ?? "Sin título extraído"}</p>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm">
        {money(c.price, c.currency) ? (
          <span className="font-semibold tabular-nums text-neutral-800">
            {money(c.price, c.currency)}
          </span>
        ) : null}
        {sub ? <span className="text-neutral-400">{sub}</span> : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
        {c.group_name ? <span>{c.group_name}</span> : null}
        {c.sender_name ? <span>· {c.sender_name}</span> : null}
        {c.contact_phone ? <span className="font-mono">· {c.contact_phone}</span> : null}
      </div>

      {c.body_preview ? (
        <p className="mt-2 line-clamp-2 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
          {c.body_preview}…
        </p>
      ) : null}
    </div>
  );
}
