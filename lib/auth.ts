// Stateless role-aware session for the password-per-role gate. The cookie holds
// "<role>.<hmac>", where the HMAC (keyed by SESSION_SECRET) is computed over the
// role itself — so the role can't be tampered with, and being httpOnly it can't
// be read by client JS. Two roles today:
//   • admin  — Pablo / business: Brokers · Panorama · Reportes
//   • dev    — técnico (superuser): everything above + technical screens
// Each role has its own password (ADMIN_PASSWORD / DEV_PASSWORD).

export const SESSION_COOKIE = "padmin";

export type Role = "admin" | "dev";
const ROLES: Role[] = ["admin", "dev"];

// dev is a superset of admin (tiered access).
export function roleCan(role: Role, needs: Role): boolean {
  if (role === "dev") return true; // superuser
  return role === needs;
}

const encoder = new TextEncoder();

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(secret: string, msg: string): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(msg));
  return toHex(sig);
}

export async function createSessionToken(role: Role, secret: string): Promise<string> {
  const sig = await sign(secret, `propia-admin:v2:${role}`);
  return `${role}.${sig}`;
}

// Returns the role if the token is valid, else null. Constant-time compare.
export async function verifySessionToken(
  token: string | undefined,
  secret: string,
): Promise<Role | null> {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const role = token.slice(0, dot) as Role;
  const sig = token.slice(dot + 1);
  if (!ROLES.includes(role)) return null;

  const expected = await sign(secret, `propia-admin:v2:${role}`);
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? role : null;
}
