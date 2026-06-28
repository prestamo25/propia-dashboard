import { fetchOverview, type BrokerRow } from "@/lib/data";

// Always fetch fresh — this is an ops view, never cache it.
export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return dateFmt.format(new Date(iso));
}

function relative(iso: string | null): string {
  if (!iso) return "Nunca";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `Hace ${hr} h`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `Hace ${day} d`;
  return fmtDate(iso);
}

function StatusPill({ status }: { status: string | null }) {
  const map: Record<string, string> = {
    approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
  };
  const cls = map[status ?? ""] ?? "bg-neutral-100 text-neutral-600 ring-neutral-200";
  const label =
    status === "approved"
      ? "Aprobado"
      : status === "pending"
        ? "Pendiente"
        : status === "rejected"
          ? "Rechazado"
          : (status ?? "—");
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {label}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-neutral-200">
      <div className="text-2xl font-semibold tracking-tight text-neutral-900">{value}</div>
      <div className="mt-0.5 text-sm text-neutral-500">{label}</div>
    </div>
  );
}

export default async function DashboardPage() {
  let data;
  try {
    data = await fetchOverview();
  } catch (e) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-xl font-semibold text-red-600">No se pudo cargar</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {e instanceof Error ? e.message : "Error desconocido."}
        </p>
        <p className="mt-4 text-sm text-neutral-500">
          Revisa SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno.
        </p>
      </main>
    );
  }

  const { brokers, totals } = data;

  return (
    <main className="mx-auto max-w-7xl p-6 sm:p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-brand">Propia · Admin</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Red de brokers</p>
        </div>
        <a
          href="/api/logout"
          className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 transition hover:bg-neutral-100"
        >
          Salir
        </a>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Brokers" value={totals.brokers} />
        <Stat label="Aprobados" value={totals.approved} />
        <Stat label="Pendientes" value={totals.pending} />
        <Stat label="Propiedades" value={totals.properties} />
      </section>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Broker</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">Estados</th>
                <th className="px-4 py-3 font-medium">Estatus</th>
                <th className="px-4 py-3 text-right font-medium">Inventario</th>
                <th className="px-4 py-3 text-right font-medium">MB</th>
                <th className="px-4 py-3 font-medium">Alta</th>
                <th className="px-4 py-3 font-medium">Última actividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {brokers.map((b: BrokerRow) => (
                <tr key={b.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900">{b.name ?? "—"}</div>
                    {b.company ? (
                      <div className="text-xs text-neutral-500">{b.company}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-700">
                    {b.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {b.states.length ? b.states.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-700">
                    {b.inventory}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-400">
                    {b.mb_used == null ? "—" : b.mb_used.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{fmtDate(b.created_at)}</td>
                  <td className="px-4 py-3 text-neutral-700">{relative(b.last_active)}</td>
                </tr>
              ))}
              {brokers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-neutral-400">
                    Sin brokers todavía.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-neutral-400">
        MB = almacenamiento en R2 (pendiente de conectar).
      </p>
    </main>
  );
}
