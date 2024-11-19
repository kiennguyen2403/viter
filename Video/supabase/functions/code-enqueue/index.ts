// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";
import { STATUS } from "../type/type.ts";
import { verifyToken } from "../utils/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  try {
    const method = req.method;

    if (method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const authHeader = req.headers.get("Authorization")!;
    if (!authHeader) {
      return new Response("Authorization header missing", {
        status: STATUS.UNAUTHORIZED,
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const payload = await verifyToken(token);

    if (!payload) {
      return new Response("Unauthorized", { status: STATUS.UNAUTHORIZED });
    }

    const supabase = Supabase.getInstance(token);

    const { error: userError } = await supabase.from("users")
      .select("id")
      .eq(
        "token_identifier",
        payload.sub,
      ).single();

    if (userError) {
      return new Response(userError.message, { status: STATUS.UNAUTHORIZED });
    }

    switch (method) {
      case "POST": {
        const { name } = await req.json();
        if (!name) {
          return new Response("Name missing", { status: STATUS.BAD_REQUEST });
        }
        const { data, error } = await supabase
          .schema("pgmq")
          .from("q_code_execution")
          .insert([{ name }])
          .select("id");

        if (error || !data) {
          return new Response(error.message, {
            status: STATUS.INTERNAL_SERVER_ERROR,
          });
        }

        return new Response(JSON.stringify({ id: data[0].id }), {
          status: STATUS.OK,
        });
      }
      case "GET": {
        const { data, error } = await supabase
          .schema("pgmq")
          .from("q_code_execution")
          .select("*");

        if (error) {
          return new Response(error.message, {
            status: STATUS.INTERNAL_SERVER_ERROR,
          });
        }

        return new Response(JSON.stringify(data), { status: STATUS.OK });
      }
      default: {
        return new Response("Method not allowed", {
          status: STATUS.METHOD_NOT_ALLOWED,
        });
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, {
        status: STATUS.INTERNAL_SERVER_ERROR,
      });
    } else {
      return new Response("An unknown error occurred", {
        status: STATUS.INTERNAL_SERVER_ERROR,
      });
    }
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/code-enqueue' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
