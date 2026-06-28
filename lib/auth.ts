// Minimal stateless session for the shared-password gate. The cookie holds an
// HMAC over a constant, keyed by SESSION_SECRET — so it can't be forged without
// the secret, and being httpOnly it can't be read by client JS. No DB, no
// per-user accounts (yet); see README for the upgrade path.

export const SESSION_COOKIE = "padmin";

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

// Deterministic token: only a holder of SESSION_SECRET can produce it.
export async function createSessionToken(secret: string): Promise<string> {
  const sig = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    encoder.encode("propia-admin:v1"),
  );
  return toHex(sig);
}

// Constant-time-ish comparison so verification doesn't leak via timing.
export async function verifySessionToken(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token) return false;
  const expected = await createSessionToken(secret);
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
