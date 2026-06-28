"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// ~100 years — an effectively permanent ban until explicitly lifted.
const BAN_DURATION = "876600h";

type Result = { error?: string };

// Block a broker at the AUTH layer: they can no longer sign in or refresh their
// session. (Their current access token stays valid until it expires — Supabase
// can't revoke an already-issued JWT — so worst case they're fully out within
// the token lifetime, and immediately on the app's next cold start.)
export async function blockBroker(id: string): Promise<Result> {
  if (!id) return { error: "Falta el id." };
  const sb = supabaseAdmin();
  const { error } = await sb.auth.admin.updateUserById(id, {
    ban_duration: BAN_DURATION,
  });
  if (error) return { error: error.message };
  revalidatePath("/");
  return {};
}

export async function unblockBroker(id: string): Promise<Result> {
  if (!id) return { error: "Falta el id." };
  const sb = supabaseAdmin();
  const { error } = await sb.auth.admin.updateUserById(id, {
    ban_duration: "none",
  });
  if (error) return { error: error.message };
  revalidatePath("/");
  return {};
}
