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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Authorization header missing", {
        status: STATUS.UNAUTHORIZED,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);

    if (!payload) {
      return new Response("Unauthorized", {
        status: STATUS.UNAUTHORIZED,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userData, error: userError } = await Supabase.getInstance(
      token,
    )
      .from("users")
      .select("id")
      .eq("token_identifier", payload.sub)
      .single();

    if (userError) {
      return new Response(`Error fetching user: ${userError.message}`, {
        status: STATUS.INTERNAL_SERVER_ERROR,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = Supabase.getInstance(token);

    const query = new URL(req.url).searchParams;
    const nanoid = query.get("nanoid");
    const id = query.get("id");

    switch (method) {
      case "GET": {
        if (nanoid) {
          const { data, error } = await supabase
            .from("meetings")
            .select("*")
            .eq("nano_id", nanoid)
            .single();

          if (error) {
            return new Response(`Error fetching meeting: ${error.message}`, {
              status: STATUS.INTERNAL_SERVER_ERROR,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify(data), {
            status: STATUS.OK,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (id) {
          const { data, error } = await supabase
            .from("meetings")
            .select("*, participants!inner(user_id)")
            .eq("participants.user_id", userData.id)
            .eq("participants.meeting_id", id)
            .single();

          if (error) {
            return new Response(`Error fetching meeting: ${error.message}`, {
              status: STATUS.INTERNAL_SERVER_ERROR,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify(data), {
            status: STATUS.OK,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data, error } = await supabase
          .from("meetings")
          .select("*, participants!inner(user_id)")
          .eq("participants.user_id", userData.id);

        if (error) {
          return new Response(`Error fetching meetings: ${error.message}`, {
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
        const body = await req.json();
        const { data, error } = await supabase
          .from("meetings")
          .insert(body)
          .select();

        if (error) {
          return new Response(
            `Error creating meeting: ${error.message}`,
            {
              status: STATUS.INTERNAL_SERVER_ERROR,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
        return new Response(JSON.stringify(data), {
          status: STATUS.OK,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "PUT": {
        if (!id) {
          return new Response("Meeting ID required", {
            status: STATUS.BAD_REQUEST,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const body = await req.json();
        const { error } = await supabase
          .from("meetings")
          .update(body)
          .eq("nano_id", id);

        if (error) {
          return new Response(`Error updating meeting: ${error.message}`, {
            status: STATUS.INTERNAL_SERVER_ERROR,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response("Meeting updated", {
          status: STATUS.OK,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "DELETE": {
        if (!id) {
          return new Response("Meeting ID required", {
            status: STATUS.BAD_REQUEST,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await supabase
          .from("meetings")
          .delete()
          .eq("id", id);

        if (error) {
          return new Response(`Error deleting meeting: ${error.message}`, {
            status: STATUS.INTERNAL_SERVER_ERROR,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response("Meeting deleted", {
          status: STATUS.OK,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      default:
        return new Response("Method not allowed", {
          status: STATUS.METHOD_NOT_ALLOWED,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/meetings' \
    --header 'Authorization: Bearer <your_token_here>' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
