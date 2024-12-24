// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { Supabase } from "../utils/supabase.ts"
import { STATUS } from "../type/type.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  try {
    const method = req.method;
    if (method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Authorization header missing", {
        status: STATUS.UNAUTHORIZED,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);

    const id = req.url.split("/").pop();
    switch (method) {
      case "GET": {
        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          return new Response(`Error fetching application: ${error.message}`, {
            status: STATUS.INTERNAL_SERVER_ERROR,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(data), {
          status: STATUS.OK,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "POST": {
        const formData = await req.formData();
        const { data, error } = await supabase
          .from("applications")
          .insert({ ...req.body })
          .single();

        if (error) {
          return new Response(`Error creating application: ${error.message}`, {
            status: STATUS.INTERNAL_SERVER_ERROR,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(data), {
          status: STATUS.CREATED,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "DELETE": {
        const { error } = await supabase
          .from("applications")
          .delete()
          .eq("id", id);

        if (error) {
          return new Response(`Error deleting application: ${error.message}`, {
            status: STATUS.INTERNAL_SERVER_ERROR,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response("Application deleted", {
          status: STATUS.OK,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      default: {
        return new Response("Method not allowed", {
          status: STATUS.METHOD_NOT_ALLOWED,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return new Response(error.message, {
        status: STATUS.INTERNAL_SERVER_ERROR,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response("An unknown error occurred", {
        status: STATUS.INTERNAL_SERVER_ERROR,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/applications' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
