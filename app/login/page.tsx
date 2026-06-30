export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2">
      {/* ── Left: brand panel (desktop only) ─────────────────────────────── */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand to-brand-dark p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {/* texture + aurora */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />

        {/* brand mark */}
        <div className="relative flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="Propia"
            className="h-11 w-11 rounded-2xl shadow-lg ring-1 ring-white/20"
          />
          <span className="text-lg font-semibold tracking-tight">Propia</span>
        </div>

        {/* headline */}
        <div className="relative">
          <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-tight">
            Panel de
            <br />
            administración
          </h1>
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-white/70">
            Gestiona la red de brokers, el inventario y la actividad de Propia en
            un solo lugar.
          </p>
        </div>

        <p className="relative text-sm text-white/45">
          Acceso restringido · solo personal autorizado
        </p>
      </aside>

      {/* ── Right: sign-in ───────────────────────────────────────────────── */}
      <div className="flex min-h-screen items-center justify-center bg-white/70 px-6 py-12 backdrop-blur-xl lg:min-h-0">
        <div className="w-full max-w-sm">
          {/* wordmark — shown on mobile where the brand panel is hidden */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-text.png"
            alt="Propia"
            className="mx-auto mb-10 h-9 w-auto lg:hidden"
          />

          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Inicia sesión
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Ingresa la contraseña para acceder al panel.
            </p>
          </div>

          <form action="/api/login" method="post">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              required
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-brand focus:ring-4 focus:ring-brand/10"
            />

            {error ? (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-rose-600">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Contraseña incorrecta.
              </p>
            ) : null}

            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-gradient-to-b from-brand to-brand-dark py-2.5 font-medium text-white shadow-sm transition hover:shadow-lift hover:brightness-[1.07] active:brightness-95"
            >
              Entrar
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-neutral-400 lg:hidden">
            Acceso restringido · solo personal autorizado
          </p>
        </div>
      </div>
    </main>
  );
}
