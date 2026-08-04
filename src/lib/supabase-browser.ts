import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./supabase-shared";

/**
 * Browser-side Supabase client using the public anon key — used only to PUT
 * a file directly to Storage against a signed upload URL (bypassing the
 * Next.js server, since large videos would otherwise hit the platform's
 * request body size limit). Never use this client for anything RLS-gated.
 */
export const supabaseBrowser = createClient(
  SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);
