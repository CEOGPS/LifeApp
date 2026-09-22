// src/lib/supabaseClient.ts
// Supabase client for browser and worker contexts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://mhvcdstgkyplhzjptgfr.supabase.co";
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export { supabaseUrl, supabasePublishableKey };

// Helper to check connection
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from("user_settings").select("count", { count: "exact", head: true });
    return !error;
  } catch {
    return false;
  }
}