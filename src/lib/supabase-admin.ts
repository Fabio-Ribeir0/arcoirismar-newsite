import "server-only";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kxrthnvcaxwvbrddaxuv.supabase.co";

/**
 * Service-role Supabase client — bypasses RLS. Server-only (never import
 * from a Client Component); used to upload files to Storage from Server
 * Actions.
 */
export const supabaseAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

export const EMPREENDIMENTOS_BUCKET = "empreendimentos";
