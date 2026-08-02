import { createClient } from "@supabase/supabase-js";

// Server-side only — uses secret key, never imported by client components
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);
