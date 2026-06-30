import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken, roleCan, type Role } from "@/lib/auth";

// Current logged-in role (server-side), or null if no valid session.
export async function getRole(): Promise<Role | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, process.env.SESSION_SECRET ?? "");
}

// Gate a page to a minimum role. dev is a superuser (sees everything); admin is
// limited to what it's granted. Redirects to /login if unauthenticated, or to /
// (the shared home) if authenticated but not permitted.
export async function requireRole(needs: Role): Promise<Role> {
  const role = await getRole();
  if (!role) redirect("/login");
  if (!roleCan(role, needs)) redirect("/");
  return role;
}
