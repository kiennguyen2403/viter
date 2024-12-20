import { createClient } from "@supabase/supabase-js";


import { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
const getSupabase = (accessToken: string) => {
  if (client)
    return client;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
  client = supabase;
  return supabase;
};

export { getSupabase };