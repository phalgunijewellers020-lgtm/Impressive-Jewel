import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || `https://${projectId}.supabase.co`;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string || publicAnonKey;

// Singleton guard: prevents a second GoTrueClient being created on HMR re-evaluation
declare global {
  interface Window { __jf_supabase?: SupabaseClient }
}

function getClient(): SupabaseClient {
  if (typeof window !== "undefined" && window.__jf_supabase) {
    return window.__jf_supabase;
  }
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  if (typeof window !== "undefined") {
    window.__jf_supabase = client;
  }
  return client;
}

export const supabase = getClient();
export const isSupabaseConfigured = true;
