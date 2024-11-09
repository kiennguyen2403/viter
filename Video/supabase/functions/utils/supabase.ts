import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

export class Supabase {
    private static instance: SupabaseClient;
    private constructor() { }
    public static getInstance(accessToken?: string): SupabaseClient {
        if (!Supabase.instance) {
            if (Deno.env.get("ENV") === "dev" || !accessToken) {
                Supabase.instance = createClient(
                    Deno.env.get("SUPABASE_URL") ?? Deno.env.get("URL")!,
                    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("KEY")!,
                );
            } else {
                Supabase.instance = createClient(
                    Deno.env.get("SUPABASE_URL") ?? Deno.env.get("URL")!,
                    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("KEY")!,
                    {
                        global: {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        },
                    },
                );
            }
        }
        return Supabase.instance;
    }
}
