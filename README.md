# propia-admin

Internal ops dashboard for Propia — the broker network at a glance: who's signed
up, what states they cover, their phone, inventory count, and (soon) storage
used. Lives at `admin.propia.dev`.

Stack: Next.js 16 · React 19 · Tailwind v4 · TypeScript (App Router) — mirrors
`propia-web`. Reads Supabase server-side with the **service role key**, so the
key never reaches the browser and no RLS gymnastics are needed.

## Run locally

```bash
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev                        # http://localhost:3000
```

### Environment (`.env.local`, and the same in Vercel)

| var | what |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` | a dedicated `sb_secret_…` key (server-only, **secret**, bypasses RLS) |
| `ADMIN_PASSWORD` | the shared password you type to log in |
| `SESSION_SECRET` | long random string to sign the cookie (`openssl rand -hex 32`) |

## Access

Single shared password (you + Pablo). The login form sets an httpOnly,
HMAC-signed session cookie; `middleware.ts` gates every route except `/login`.
To graduate to real per-admin accounts later, swap the check in
`app/api/login/route.ts` + `middleware.ts` for Supabase auth scoped to admin
user ids — the data layer (`lib/`) doesn't change.

## Deploy (Vercel)

1. Push to GitHub (done).
2. Import the repo in Vercel → add the four env vars above → deploy.
3. Add the domain `admin.propia.dev` in Vercel, then the matching CNAME in
   Cloudflare DNS.

## TODO

- **MB used** — photos live in Cloudflare R2 (`<uid>/` prefix), not Postgres, so
  storage isn't a DB column. Wire it by either summing the R2 prefix in a server
  route or recording byte size at upload. Column is stubbed as `—` for now.
- Client-side search / sort on the table.
- Per-broker drill-down (their listings, requerimientos).
