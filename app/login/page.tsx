export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-brand">
            Propia · Admin
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Panel interno</p>
        </div>

        <form
          action="/api/login"
          method="post"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200"
        >
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
            className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          />

          {error ? (
            <p className="mt-3 text-sm text-red-600">Contraseña incorrecta.</p>
          ) : null}

          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-brand py-2.5 font-medium text-white transition hover:bg-brand-dark"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
