import { createClient } from "@supabase/supabase-js"

const url = process.env.SUPABASE_URL!
const anonKey = process.env.SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Public client — for client-side reads (anon key)
export const supabase = createClient(url, anonKey)

// Server-side admin client — bypasses RLS, never expose to browser
export function supabaseAdmin() {
  return createClient(url, serviceKey)
}
