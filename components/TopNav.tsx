import Link from "next/link";
import { countOpenReports } from "@/lib/reports";

export async function TopNav({
  active,
}: {
  active: "brokers" | "panorama" | "reportes";
}) {
  const openReports = await countOpenReports();

  const tab = (
    href: string,
    label: string,
    key: "brokers" | "panorama" | "reportes",
    badge?: number,
  ) => (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active === key
          ? "bg-white text-neutral-900 shadow-sm ring-1 ring-black/[0.04]"
          : "text-neutral-500 hover:text-neutral-800"
      }`}
    >
      {label}
      {badge && badge > 0 ? (
        <span className="grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold tabular-nums text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-black/[0.05] bg-white/65 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt="Propia"
              className="h-8 w-8 rounded-xl shadow-sm ring-1 ring-black/[0.06]"
            />
            <span className="text-[15px] font-semibold tracking-tight text-neutral-900">
              Propia <span className="font-normal text-neutral-400">Admin</span>
            </span>
          </div>
          <nav className="flex items-center gap-1 rounded-xl bg-neutral-200/40 p-1">
            {tab("/", "Brokers", "brokers")}
            {tab("/panorama", "Panorama", "panorama")}
            {tab("/reportes", "Reportes", "reportes", openReports)}
          </nav>
        </div>
        <a
          href="/api/logout"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-500 ring-1 ring-neutral-200 transition hover:bg-white hover:text-neutral-800"
        >
          Salir
        </a>
      </div>
    </header>
  );
}
