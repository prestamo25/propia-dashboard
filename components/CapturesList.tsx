"use client";

import { useMemo, useState } from "react";
import { relative } from "@/lib/format";
import type { Capture } from "@/lib/bot";

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

export function CapturesList({ captures }: { captures: Capture[] }) {
  const [region, setRegion] = useState<string>("all");

  const regions = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of captures) m.set(c.region, (m.get(c.region) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [captures]);

  const rows = useMemo(
    () => (region === "all" ? captures : captures.filter((c) => c.region === region)),
    [captures, region],
  );

  return (
    <div>
      {regions.length > 1 ? (
        <div className="mb-4 flex flex-wrap items-center gap-1 rounded-xl bg-neutral-200/40 p-1">
          <Chip label="Todas" count={captures.length} active={region === "all"} onClick={() => setRegion("all")} />
          {regions.map(([r, n]) => (
            <Chip key={r} label={r} count={n} active={region === r} onClick={() => setRegion(r)} />
          ))}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/50 py-16 text-center text-sm text-neutral-400">
          Sin capturas en esta región.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((c) => (
            <CaptureCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-white text-neutral-900 shadow-sm ring-1 ring-black/[0.04]"
          : "text-neutral-500 hover:text-neutral-800"
      }`}
    >
      {label}
      <span className="rounded-full bg-neutral-100 px-1.5 text-xs tabular-nums text-neutral-500">
        {count}
      </span>
    </button>
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
  const sub = [
    typeLabel,
    c.operation === "renta" ? "Renta" : c.operation === "venta" ? "Venta" : null,
    c.location,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="rounded-2xl border border-black/[0.05] bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          {c.region}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${kindMeta.cls}`}>
          {kindMeta.label}
        </span>
        {c.promoted ? (
          <span className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-medium text-brand ring-1 ring-inset ring-brand/20">
            ✓ Promovida
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
          <span className="font-semibold tabular-nums text-neutral-800">{money(c.price, c.currency)}</span>
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
