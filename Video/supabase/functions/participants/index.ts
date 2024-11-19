// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";
import { verifyToken } from "../utils/auth.ts";
import { STATUS } from "../type/type.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  try {
    const method = req.method;

    if (method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    console.log("req", req);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Authorization header missing", {
        status: STATUS.UNAUTHORIZED,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);

    if (!payload) {
      return new Response("Unauthorized", {
        status: STATUS.UNAUTHORIZED,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq(
        "token_identifier",
        payload.sub,
      ).single();
  
    if (userError) {
      return new Response(userError.message, {
        status: STATUS.UNAUTHORIZED,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const id = req.url.split("/").pop();
    switch (method) {
      case "GET": {
        if (id) {
          const { data, error } = await supabase
            .from("participants")
            .select("*")
            .eq("meeting_id", id)
            .eq("user_id", userData.id)
            .single();
          if (error) {
            return new Response(error.message, {
              status: STATUS.INTERNAL_SERVER_ERROR,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify(data), {
            status: STATUS.OK,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else {
          const { data, error } = await supabase
            .from("participants")
            .select("*")
            .eq("user_id", userData.id)
            .order("created_at", { ascending: false });

          if (error) {
            return new Response(error.message, {
              status: STATUS.INTERNAL_SERVER_ERROR,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify(data), {
            status: STATUS.OK,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
      case "POST": {
        const body = await req.json();
        const { data, error } = await supabase.from("participants").upsert([
          {
            ...body,
            user_id: userData.id,
          },
        ]);
        if (error) {
          return new Response(error.message, {
            status: STATUS.INTERNAL_SERVER_ERROR,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(data), {
          status: STATUS.CREATED,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "PUT": {
        if (!id) {
          return new Response("Missing meeting ID", {
            status: STATUS.BAD_REQUEST,
          });
        }
        const { data: meetingData, error: meetingError } = await supabase
          .from("meetings")
          .select("*")
          .eq("nano_id", id)
          .single();
        if (meetingError) {
          return new Response(meetingError.message, {
            status: STATUS.INTERNAL_SERVER_ERROR,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const body = await req.json();
        const { data, error } = await supabase.from("participants")
          .upsert({
            ...body,
            user_id: userData.id,
            meeting_id: meetingData.id,
          })
          .eq("meeting_id", meetingData.id)
          .eq("user_id", userData.id);
        if (error) {
          return new Response(error.message, {
            status: STATUS.INTERNAL_SERVER_ERROR,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(data), {
          status: STATUS.OK,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "DELETE": {
        if (!id) {
          return new Response("Missing participant ID", {
            status: STATUS.BAD_REQUEST,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { data, error } = await supabase
          .from("participants")
          .delete()
          .eq("id", id);
        if (error) {
          return new Response(error.message, {
            status: STATUS.INTERNAL_SERVER_ERROR,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(data), {
          status: STATUS.OK,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      default: {
        return new Response("Method Not Allowed", {
          status: STATUS.METHOD_NOT_ALLOWED,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
  } catch (error) {
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
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/participants' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
