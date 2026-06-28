import { fetchOverview } from "@/lib/data";
import { BrokerTable } from "@/components/BrokerTable";

// Always fetch fresh — this is an ops view, never cache it.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let data;
  try {
    data = await fetchOverview();
  } catch (e) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-xl font-semibold text-rose-600">No se pudo cargar</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {e instanceof Error ? e.message : "Error desconocido."}
        </p>
        <p className="mt-4 text-sm text-neutral-500">
          Revisa SUPABASE_URL y SUPABASE_SECRET_KEY en el entorno.
        </p>
      </main>
    );
  }

  const { brokers, totals } = data;

  return (
    <div className="min-h-screen bg-[radial-gradient(120%_120%_at_50%_-20%,#ffffff_0%,#f5f7fa_55%,#eef1f6_100%)]">
      {/* Frosted top bar */}
      <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white shadow-sm">
              P
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold tracking-tight text-neutral-900">
                Propia
              </span>
              <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                Admin
              </span>
            </div>
          </div>
          <a
            href="/api/logout"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-500 ring-1 ring-neutral-200 transition hover:bg-white hover:text-neutral-800"
          >
            Salir
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Red de brokers
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Vista general de la red en tiempo real.
          </p>
        </div>

        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Brokers"
            value={totals.brokers}
            tint={{ bg: "#e8edff", fg: "#1c4588" }}
            icon={
              <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </>
            }
          />
          <StatCard
            label="Aprobados"
            value={totals.approved}
            tint={{ bg: "#d8f5e6", fg: "#047857" }}
            icon={
              <>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </>
            }
          />
          <StatCard
            label="Pendientes"
            value={totals.pending}
            tint={{ bg: "#fdf0d5", fg: "#b45309" }}
            icon={
              <>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </>
            }
          />
          <StatCard
            label="Propiedades"
            value={totals.properties}
            tint={{ bg: "#ede9fe", fg: "#7c3aed" }}
            icon={
              <>
                <path d="M3 9.5 12 3l9 6.5" />
                <path d="M5 10v10h14V10" />
                <path d="M9 21v-6h6v6" />
              </>
            }
          />
        </section>

        <BrokerTable brokers={brokers} />

        <p className="mt-4 text-xs text-neutral-400">
          MB = almacenamiento en R2 (pendiente de conectar).
        </p>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tint: { bg: string; fg: string };
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white/80 p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-14px_rgba(16,24,40,0.14)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(16,24,40,0.05),0_14px_32px_-14px_rgba(16,24,40,0.22)]">
      <span
        className="grid h-9 w-9 place-items-center rounded-xl"
        style={{ background: tint.bg, color: tint.fg }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </span>
      <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-neutral-900">
        {value}
      </div>
      <div className="mt-0.5 text-sm text-neutral-500">{label}</div>
    </div>
  );
}
