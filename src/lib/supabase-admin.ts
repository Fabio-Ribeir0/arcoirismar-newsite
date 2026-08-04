import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, EMPREENDIMENTOS_BUCKET } from "./supabase-shared";

/**
 * Service-role Supabase client — bypasses RLS. Server-only (never import
 * from a Client Component); used to upload files to Storage from Server
 * Actions.
 */
export const supabaseAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

export { EMPREENDIMENTOS_BUCKET };
